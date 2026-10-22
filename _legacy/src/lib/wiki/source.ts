import { parseFrontmatter } from './frontmatter';
import { normalizeTarget, setWikiIndex, type WikiEntry } from './registry';

export interface SourceDoc {
  /** 与 `entry.id` 一致：相对 content/blog 的路径，不含扩展名 */
  slug: string;
  file: string;
  raw: string;
  title: string;
  aliases: string[];
  tags: string[];
  draft: boolean;
}

/**
 * 只取原始文本，不走 markdown 渲染管线 —— 几百篇也能在毫秒级扫完。
 * 注意：本模块只能在 Vite/Astro 上下文里 import，不要被 astro.config 引用。
 */
const rawFiles = import.meta.glob('../../content/blog/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export const sourceDocs: SourceDoc[] = Object.entries(rawFiles)
  .map(([file, raw]) => {
    const slug = /content\/blog\/(.+)\.md$/.exec(file)?.[1] ?? '';
    const fm = parseFrontmatter(raw);
    return {
      slug,
      file,
      raw,
      title: fm.title || slug,
      aliases: fm.aliases,
      tags: fm.tags,
      draft: fm.draft,
    };
  })
  .filter((doc) => doc.slug !== '')
  .sort((a, b) => a.slug.localeCompare(b.slug));

/** 解析表：slug / 别名 / 标题（都做归一化）→ 条目。供构建期链接图与坏链检测使用。 */
export const wikiIndex: Map<string, WikiEntry> = (() => {
  const map = new Map<string, WikiEntry>();
  const put = (key: string, entry: WikiEntry) => {
    const normalized = normalizeTarget(key);
    if (normalized && !map.has(normalized)) map.set(normalized, entry);
  };

  for (const doc of sourceDocs) {
    const entry: WikiEntry = { slug: doc.slug, title: doc.title };
    put(doc.slug, entry);
    for (const alias of doc.aliases) put(alias, entry);
    put(doc.title, entry);
  }
  return map;
})();

// 页面侧渲染也需要同一份索引（graph.ts 的坏链检测依赖 resolveWiki）
setWikiIndex(wikiIndex);
