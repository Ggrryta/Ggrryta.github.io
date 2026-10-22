# Ggrryta 的个人站

作品集 + 博客，基于 [Astro](https://astro.build) 构建，托管在 GitHub Pages。

线上地址：https://ggrryta.github.io

## 本地开发

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # 产物输出到 dist/
npm run preview  # 本地预览构建结果
```

## 发布

推送到 `main` 分支后，`.github/workflows/deploy.yml` 会自动构建并发布到 GitHub Pages。

首次使用需要在仓库 **Settings → Pages → Source** 里把来源设为 **GitHub Actions**。

## 目录结构

```
src/
  content.config.ts     两个 collection 的字段定义
  content/blog/         文章，一个 md 文件就是一篇
  content/projects/     作品，卡片式内容
  lib/content.ts        查询、排序、标签统计、日期格式化
  lib/graph.ts          链接图：正向/反向链接、坏链检测、相关推荐
  lib/wiki/             wikilink 解析插件与索引（渲染期 + 构建期共用规则）
  layouts/              页面骨架
  components/           头部、底部、作品卡片、相关推荐、反向链接
  pages/                路由：首页 / 文章 / 作品 / 标签 / 看板 / RSS / 404
  site.ts               站名、简介、社交链接，改这里
  styles/global.css     全部样式
```

## 写新内容

文章 —— 在 `src/content/blog/` 新建 `.md`：

```markdown
---
title: "标题"
description: "列表页显示的一句话摘要"
pubDate: 2026-10-22
tags: ["Astro", "随笔"]
draft: false
---

正文从这里开始。
```

作品 —— 在 `src/content/projects/` 新建 `.md`，`featured: true` 会显示在首页。

## 文章互链

正文里用 `[[...]]` 就能链到另一篇文章，不用写完整路径：

```markdown
[[content-collections-notes]]                  <!-- 用 slug（文件名） -->
[[内容集合|那篇笔记]]                          <!-- 用别名，并可自定义显示文字 -->
[[content-collections-notes#渲染|渲染部分]]     <!-- 跳到某个小标题 -->

[/blog/hello-world/](/blog/hello-world/)       <!-- 普通站内链接同样被识别 -->
```

可在 frontmatter 里给文章加 `aliases`，之后用别名也能链到它（改标题时的保险）：

```yaml
aliases: ["内容集合", "collections"]
```

规则：

- 链接目标必须是某篇文章的 **slug / 别名 / 标题**，否则 `npm run build` 会 **直接失败** 并指出是哪篇第几行（`astro dev` 下只警告不中断）
- 链接指向 `draft: true` 的文章会警告（草稿不生成页面，发布后等于 404）
- 每篇文章底部会自动生成「相关」与「被引用」两块，数据来自构建期扫描的链接图
- 围栏代码块里的链接不会被计入
- `/stats` 是内容看板：孤儿文章（无入链）、未打标签、失效链接、被引用最多

> 改过内容后如果发现互链没更新，删掉 `node_modules/.astro` 再构建 —— Astro 会缓存渲染结果。

## 自定义域名（可选）

1. 在 `public/CNAME` 里写入域名，例如 `example.com`
2. DNS 添加 CNAME 记录指向 `ggrryta.github.io`
3. Pages 设置里填写该域名并勾选 Enforce HTTPS

## 待办

- [ ] 接入 giscus 评论
- [ ] 文章阅读时长与目录
- [ ] 作品封面图
- [ ] 访问统计（Umami）
