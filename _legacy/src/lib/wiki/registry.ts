export interface WikiEntry {
  slug: string;
  title: string;
}

/**
 * 解析 `[[target|label]]` 的共享规则：插件（渲染期）与 graph（构建期）必须完全一致，
 * 否则「能渲染」和「能校验」会对不上。
 */
export const WIKI_RE = /\[\[([^\[\]|#]+?)(?:#([^\[\]|]+?))?(?:\|([^\[\]]+?))?\]\]/g;

export function normalizeTarget(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** 索引未就绪时的兜底：直接把 target 当 slug 用。 */
export function slugifyTarget(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}\-_/]/gu, '');
}

/**
 * 索引必须挂在 globalThis 上，不能用模块级变量：
 * astro.config.mjs 会被 esbuild 单独打包一份，插件里的 registry 与页面里 source.ts
 * 引用的 registry 是两个不同的模块实例，模块级变量互不可见。
 */
const STORE_KEY = '__ggrryta_wiki_index__';

type Store = { index: Map<string, WikiEntry> | null };

function store(): Store {
  const scope = globalThis as unknown as Record<string, Store | undefined>;
  if (!scope[STORE_KEY]) scope[STORE_KEY] = { index: null };
  return scope[STORE_KEY] as Store;
}

export function setWikiIndex(next: Map<string, WikiEntry>): void {
  store().index = next;
}

export function getWikiIndex(): Map<string, WikiEntry> | null {
  return store().index;
}

export function resolveWiki(target: string): WikiEntry | null {
  const index = store().index;
  if (!index) return null;
  return index.get(normalizeTarget(target)) ?? null;
}
