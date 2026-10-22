# Ggrryta 的博客

技术笔记与折腾记录。基于 [AstroPaper](https://github.com/satnaing/astro-paper)（MIT）+ Astro，部署在 GitHub Pages。

线上地址：https://ggrryta.github.io

## 本地开发

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # astro check + 构建 + Pagefind 建索引
npm run preview  # 预览构建结果
```

需要 Node ≥ 22.12（AstroPaper 的 engines 要求）。

## 写新文章

在 `src/content/posts/` 新建 `.md` 或 `.mdx`：

```markdown
---
author: Ggrryta
pubDatetime: 2026-10-22T12:00:00+08:00
title: "标题"
description: "列表页与 SEO 用的一句话摘要"
featured: false
draft: false
tags:
  - Astro
  - 踩坑记录
---

正文。
```

- 文件名即 slug（可加子目录）
- `draft: true` 的文章只在 `npm run dev` 可见，构建时不产出
- `featured: true` 会进首页精选位
- 写 `Table of contents` 这个标题，remark-toc 会自动在下面塞目录

## 改配置

**`astro-paper.config.ts`** —— 站点信息、社交链接、功能开关（主题只改这一个文件即可）：

| 项 | 说明 |
| --- | --- |
| `site` | url / title / description / author / lang / timezone |
| `posts.perPage` | 分页每页条数，当前 10 |
| `features.search` | `"pagefind"` |
| `features.dynamicOgImage` | 当前 `false`，见下 |
| `features.editPost` | 文章底部「编辑本页」跳转地址 |
| `socials` / `shareLinks` | 页脚社交图标、分享按钮 |

**`src/i18n/lang/zh.ts`** —— 界面文案（导航、分页、404 等），默认 locale 为 `zh`。

## 部署

推送到 `main` 后 `.github/workflows/deploy.yml` 自动构建发布（Node 22 + `npm ci`）。首次需在仓库 **Settings → Pages → Source** 选择 **GitHub Actions**。

## 相对原主题改了什么

1. **中文化**：新增 `src/i18n/lang/zh.ts`，`astro.config.ts` 的 i18n locale 改为 `zh`，`site.lang` / `timezone` 改为 `zh` / `Asia/Shanghai`
2. **关闭动态 OG 图**：`features.dynamicOgImage: false`，并删掉 `src/pages/og.png.ts`。原因是它依赖构建时从 Google Fonts 拉字体——离线构建会失败，且该字体不包含中文字形，标题是中文时会渲染成方块。现用静态 `public/default-og.jpg`
3. **去掉 Google 字体**：移除 `astro.config.ts` 的 `fonts` 配置与 `Layout.astro` 里的 `<Font>`，`--font-app` 换成系统字体栈（含 PingFang / 微软雅黑）
4. **清空示例文章**：模板自带的 10 篇英文文档移到 `_legacy/ap-demo-posts/`
5. **`tsconfig.json` 排除 `_legacy`**，否则 `astro check` 会把备份代码一起检查导致误报

## `_legacy/` 是什么

上一版自建站的备份，**不要直接删**：

- `_legacy/src/lib/wiki/`、`_legacy/src/lib/graph.ts` —— 自建的互链层：`[[wikilink]]`、反向链接、坏链检测、相关推荐、`/stats` 内容看板
- `_legacy/src/content/blog/` —— 旧文章
- `_legacy/src/content/projects/` —— 作品集内容（agent-mesh / autotest / dashouzi）
- `_legacy/ap-demo-posts/`、`_legacy/ap-tmp-orig/` —— 模板自带示例与原始副本，可随时删

等文章多起来要移植互链层时从这里取，移植时需把 `/blog/` 改成 `/posts/`、`src/content/blog` 改成 `src/content/posts`（建议先抽成路径常量）。

## 待办

- [ ] 在 `src/content/pages/about.md` 里填上作品集外链（现在写着「待填」）
- [ ] 接入 giscus 评论（文章多起来再说）。前置三件事：仓库 public、Settings → General → Features 开 **Discussions**、安装 [giscus app](https://github.com/apps/giscus)。然后在 <https://giscus.app/> 填仓库拿 `data-repo-id` / `data-category-id`，插到 `src/layouts/PostDetails.astro` 底部（分享按钮下面）。模板官方教程见 `_legacy/ap-demo-posts/how-to-integrate-giscus-comments.md`；建议用「纯 script + postMessage 跟随主题切换」，不必为此引入 React
- [ ] 换一张自己的 `public/default-og.jpg`
- [ ] 换一张自己的 `public/default-og.jpg`
- [ ] 文章多了之后移植互链层
