import { WIKI_RE, resolveWiki, slugifyTarget } from './registry';

interface MdNode {
  type: string;
  value?: string;
  url?: string;
  children?: MdNode[];
  data?: { hProperties?: Record<string, string> };
}

/**
 * 把 `[[slug]]`、`[[别名|显示文本]]`、`[[slug#小标题]]` 渲染成站内链接。
 * 索引还没注入时（例如没有先建链接图）退化成 slugify，保证永远不会渲染出空链接。
 */
export function remarkWikiLink() {
  return (tree: MdNode) => {
    walk(tree, (node) => {
      if (node.type !== 'text' || !node.value || !node.value.includes('[[')) return null;

      const out: MdNode[] = [];
      let last = 0;
      let m: RegExpExecArray | null;
      WIKI_RE.lastIndex = 0;

      while ((m = WIKI_RE.exec(node.value)) !== null) {
        if (m.index > last) {
          out.push({ type: 'text', value: node.value.slice(last, m.index) });
        }

        const [, target, anchor, label] = m;
        const entry = resolveWiki(target);
        const slug = entry ? entry.slug : slugifyTarget(target);
        const href = `/blog/${slug}/${anchor ? `#${anchor}` : ''}`;

        out.push({
          type: 'link',
          url: href,
          data: {
            hProperties: entry
              ? { 'data-wikilink': slug }
              : { 'data-wikilink': slug, 'data-wikilink-missing': 'true' },
          },
          children: [{ type: 'text', value: label ?? entry?.title ?? target }],
        });

        last = m.index + m[0].length;
      }

      if (out.length === 0) return null;
      if (last < node.value.length) {
        out.push({ type: 'text', value: node.value.slice(last) });
      }
      return out;
    });
  };
}

function walk(node: MdNode, cb: (n: MdNode) => MdNode[] | null): void {
  const children = node.children;
  if (!children) return;

  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.type === 'text') {
      const replacement = cb(child);
      if (replacement) {
        children.splice(i, 1, ...replacement);
        i += replacement.length - 1;
      }
    } else {
      walk(child, cb);
    }
  }
}
