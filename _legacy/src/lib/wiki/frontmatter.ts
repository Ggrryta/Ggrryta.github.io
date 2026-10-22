/**
 * 纯 frontmatter 解析：不依赖 Vite，因此 config 侧（esbuild 打包）和页面侧都能用。
 * 只取互链需要的几个字段，够用且不引第三方 yaml 依赖。
 */
export interface ParsedFrontmatter {
  title: string;
  aliases: string[];
  tags: string[];
  draft: boolean;
}

function clean(value: string): string {
  return value.trim().replace(/^["']|["']$/g, '');
}

function fieldString(fm: string, key: string): string {
  const m = new RegExp(`^${key}:\\s*(.+)$`, 'm').exec(fm);
  return m ? clean(m[1]) : '';
}

function fieldList(fm: string, key: string): string[] {
  const out: string[] = [];
  const inline = new RegExp(`^${key}:\\s*(.+)$`, 'm').exec(fm);

  if (inline) {
    const value = inline[1].trim();
    if (value.startsWith('[')) {
      for (const part of value.replace(/^\[/, '').replace(/\]$/, '').split(',')) {
        const item = clean(part);
        if (item) out.push(item);
      }
    } else if (value && value !== '[]') {
      out.push(clean(value));
    }
    return out;
  }

  const block = new RegExp(`^${key}:\\s*\\n((?:\\s*-\\s*.+\\n?)+)`, 'm').exec(fm);
  if (block) {
    for (const line of block[1].split('\n')) {
      const item = clean(line.replace(/^\s*-\s*/, ''));
      if (item) out.push(item);
    }
  }
  return out;
}

export function parseFrontmatter(raw: string): ParsedFrontmatter {
  const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw)?.[1] ?? '';
  return {
    title: fieldString(fm, 'title'),
    aliases: fieldList(fm, 'aliases'),
    tags: fieldList(fm, 'tags'),
    draft: /^draft:\s*true\b/m.test(fm),
  };
}
