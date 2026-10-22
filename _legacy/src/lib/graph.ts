import { WIKI_RE, resolveWiki } from './wiki/registry';
import { sourceDocs, type SourceDoc } from './wiki/source';

export interface LinkRef {
  from: string;
  to: string;
  line: number;
  context: string;
}

export interface BrokenRef {
  from: string;
  target: string;
  line: number;
}

export interface LinkGraph {
  docs: SourceDoc[];
  titles: Map<string, string>;
  outgoing: Map<string, LinkRef[]>;
  backlinks: Map<string, LinkRef[]>;
  broken: BrokenRef[];
  /** 指向了 draft 文章（不会生成页面，等于线上 404） */
  draftTargets: LinkRef[];
  /** 没有任何入链的已发布文章 */
  orphans: string[];
  noTags: string[];
  totalLinks: number;
}

const MD_LINK_RE = /\[[^\]]*\]\((\/blog\/[^)\s]*)\)/g;

/** 把围栏代码块涂成空格，保留换行以免行号错位 */
function blankOutCode(text: string): string {
  return text.replace(/(^|\n)(```[\s\S]*?```|~~~[\s\S]*?~~~)/g, (all) =>
    all.replace(/[^\n]/g, ' '),
  );
}

function lineAt(text: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index; i++) if (text[i] === '\n') line++;
  return line;
}

function contextOf(body: string, start: number, end: number): string {
  const from = Math.max(0, start - 90);
  const to = Math.min(body.length, end + 90);
  let snippet = body
    .slice(from, to)
    .replace(/\[\[([^\[\]|#]+?)(?:#[^\[\]|]+?)?(?:\|([^\[\]]+?))?\]\]/g, (_m, t, label) => label ?? t)
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`>#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return `${from > 0 ? '…' : ''}${snippet}${to < body.length ? '…' : ''}`;
}

function slugFromBlogUrl(url: string): string {
  return url
    .replace(/^\/blog\//, '')
    .replace(/\/$/, '')
    .split('#')[0];
}

function buildGraph(): LinkGraph {
  const published = sourceDocs.filter((doc) => !doc.draft);
  const knownSlugs = new Set(sourceDocs.map((doc) => doc.slug));
  const titles = new Map(sourceDocs.map((doc) => [doc.slug, doc.title]));

  const outgoing = new Map<string, LinkRef[]>();
  const backlinks = new Map<string, LinkRef[]>();
  const broken: BrokenRef[] = [];
  const draftTargets: LinkRef[] = [];
  const draftSlugs = new Set(sourceDocs.filter((d) => d.draft).map((d) => d.slug));

  const push = (map: Map<string, LinkRef[]>, key: string, ref: LinkRef) => {
    const list = map.get(key);
    if (list) list.push(ref);
    else map.set(key, [ref]);
  };

  for (const doc of published) {
    const fm = /^---\r?\n[\s\S]*?\r?\n---/.exec(doc.raw);
    const fmLines = fm ? fm[0].split('\n').length - 1 : 0;
    const body = blankOutCode(doc.raw.slice(fm ? fm[0].length : 0));

    const record = (to: string, start: number, end: number) => {
      if (to === doc.slug) return;
      const ref: LinkRef = {
        from: doc.slug,
        to,
        line: fmLines + lineAt(body, start),
        context: contextOf(body, start, end),
      };
      push(outgoing, doc.slug, ref);
      push(backlinks, to, ref);
      if (draftSlugs.has(to)) draftTargets.push(ref);
    };

    const brokenOnce = new Set<string>();
    const markBroken = (target: string, line: number) => {
      const key = `${target}@${line}`;
      if (brokenOnce.has(key)) return;
      brokenOnce.add(key);
      broken.push({ from: doc.slug, target, line });
    };

    let m: RegExpExecArray | null;
    WIKI_RE.lastIndex = 0;
    while ((m = WIKI_RE.exec(body)) !== null) {
      const target = m[1];
      const line = fmLines + lineAt(body, m.index);
      const entry = resolveWiki(target);
      if (!entry) {
        markBroken(`[[${target}]]`, line);
        continue;
      }
      record(entry.slug, m.index, m.index + m[0].length);
    }

    MD_LINK_RE.lastIndex = 0;
    while ((m = MD_LINK_RE.exec(body)) !== null) {
      const slug = slugFromBlogUrl(m[1]);
      if (!slug) continue;
      const line = fmLines + lineAt(body, m.index);
      if (!knownSlugs.has(slug)) {
        markBroken(m[1], line);
        continue;
      }
      record(slug, m.index, m.index + m[0].length);
    }
  }

  for (const list of outgoing.values()) list.sort((a, b) => a.line - b.line);
  for (const list of backlinks.values()) list.sort((a, b) => a.from.localeCompare(b.from));

  const orphans = published
    .filter((doc) => (backlinks.get(doc.slug) ?? []).length === 0)
    .map((doc) => doc.slug);

  const noTags = published.filter((doc) => doc.tags.length === 0).map((doc) => doc.slug);

  return {
    docs: published,
    titles,
    outgoing,
    backlinks,
    broken,
    draftTargets,
    orphans,
    noTags,
    totalLinks: [...outgoing.values()].reduce((sum, list) => sum + list.length, 0),
  };
}

let cached: LinkGraph | null = null;

export async function getLinkGraph(): Promise<LinkGraph> {
  if (!cached) {
    cached = buildGraph();
    report(cached);
  }
  return cached;
}

function report(graph: LinkGraph): void {
  const line = (ref: BrokenRef) =>
    `  · ${ref.from} 第 ${ref.line} 行 → ${ref.target}`;

  if (graph.broken.length > 0) {
    const detail = graph.broken.map(line).join('\n');
    if (import.meta.env.PROD) {
      throw new Error(
        `发现 ${graph.broken.length} 处失效的内部链接：\n${detail}\n` +
          `（链接目标必须是文章的 slug、别名或标题）`,
      );
    }
    console.warn(`\n[links] 发现 ${graph.broken.length} 处失效的内部链接：\n${detail}\n`);
  }

  if (graph.draftTargets.length > 0) {
    console.warn(
      `\n[links] 有 ${graph.draftTargets.length} 处链接指向了 draft 文章，发布后会出现 404。\n`,
    );
  }
}

/** 相关推荐：直接互链权重最高，共享标签次之 */
export function relatedTo(graph: LinkGraph, slug: string, limit = 5): string[] {
  const scores = new Map<string, number>();
  const bump = (target: string, weight: number) => {
    if (target === slug) return;
    scores.set(target, (scores.get(target) ?? 0) + weight);
  };

  for (const ref of graph.outgoing.get(slug) ?? []) bump(ref.to, 3);
  for (const ref of graph.backlinks.get(slug) ?? []) bump(ref.from, 2);

  const self = graph.docs.find((doc) => doc.slug === slug);
  if (self) {
    for (const doc of graph.docs) {
      if (doc.slug === slug) continue;
      const shared = doc.tags.filter((tag) => self.tags.includes(tag)).length;
      if (shared > 0) bump(doc.slug, shared);
    }
  }

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([target]) => target);
}
