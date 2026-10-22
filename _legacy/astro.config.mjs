import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { remarkWikiLink } from './src/lib/wiki/remark-wikilink.ts';
import { syncWikiIndex } from './src/lib/wiki/fs-index.ts';

// 插件跑在 config 这一侧，索引也必须在这里灌进去；
// dev 下靠下面的 watcher 跟随内容变化重建。
syncWikiIndex();

const wikiIndexRefresh = {
  name: 'wiki-index-refresh',
  configureServer(server) {
    server.watcher.on('all', (_event, file) => {
      if (file.includes('src/content/blog') && file.endsWith('.md')) syncWikiIndex();
    });
  },
};

export default defineConfig({
  site: 'https://ggrryta.github.io',
  base: '/',
  integrations: [sitemap()],
  markdown: {
    remarkPlugins: [remarkWikiLink],
    shikiConfig: {
      theme: 'github-light',
      wrap: true,
    },
  },
  vite: {
    plugins: [wikiIndexRefresh],
  },
});
