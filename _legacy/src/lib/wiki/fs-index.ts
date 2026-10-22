import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parseFrontmatter } from './frontmatter';
import { normalizeTarget, setWikiIndex, type WikiEntry } from './registry';

/**
 * 供 remark 插件使用的索引构建器。
 * 只能在 astro.config 侧调用 —— 那里是 esbuild 打包的独立 realm，
 * 拿不到 import.meta.glob，所以用 fs 直读。
 *
 * 注意：不能用 import.meta.url 定位，打包后它指向临时产物目录。
 */
const CONTENT_DIR = join(process.cwd(), 'src', 'content', 'blog');

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (entry.endsWith('.md')) out.push(full);
  }
  return out;
}

export function syncWikiIndex(): void {
  if (!existsSync(CONTENT_DIR)) {
    console.warn(`[wiki] 找不到文章目录：${CONTENT_DIR}，[[wikilink]] 将无法解析`);
    return;
  }

  const map = new Map<string, WikiEntry>();
  const put = (key: string, entry: WikiEntry) => {
    const normalized = normalizeTarget(key);
    if (normalized && !map.has(normalized)) map.set(normalized, entry);
  };

  for (const file of walk(CONTENT_DIR)) {
    const slug = relative(CONTENT_DIR, file).replace(/\\/g, '/').replace(/\.md$/, '');
    if (!slug) continue;

    const raw = readFileSync(file, 'utf8');
    const { title, aliases } = parseFrontmatter(raw);
    const entry: WikiEntry = { slug, title: title || slug };

    put(slug, entry);
    for (const alias of aliases) put(alias, entry);
    put(entry.title, entry);
  }

  setWikiIndex(map);
}
