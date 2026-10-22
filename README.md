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
  layouts/              页面骨架
  components/           头部、底部、作品卡片
  pages/                路由：首页 / 文章 / 作品 / 标签 / RSS / 404
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

## 自定义域名（可选）

1. 在 `public/CNAME` 里写入域名，例如 `example.com`
2. DNS 添加 CNAME 记录指向 `ggrryta.github.io`
3. Pages 设置里填写该域名并勾选 Enforce HTTPS

## 待办

- [ ] 接入 giscus 评论
- [ ] 文章阅读时长与目录
- [ ] 作品封面图
- [ ] 访问统计（Umami）
