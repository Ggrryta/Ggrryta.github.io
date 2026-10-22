---
title: "这个站点是怎么搭起来的"
description: "用 Astro + GitHub Pages 搭一个作品集与博客合体的个人站，从零到上线的完整记录。"
pubDate: 2026-10-22
tags: ["Astro", "GitHub Pages", "踩坑记录"]
---

折腾个人站这件事，我反复推翻过好几次方案。最后定下来的组合是 **Astro + GitHub Pages**，理由很简单：我想同时放作品和文章，而这两类内容的结构完全不同。

## 为什么不是纯博客

作品是卡片式的——封面、技术栈、外链；文章是线性的——标题、日期、正文。把它们塞进同一套模板里，迟早要打架。Astro 的 Content Collections 允许我定义两套 schema，各管各的：

```ts
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({ /* 文章字段 */ }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({ /* 作品字段 */ }),
});
```

新增内容的方式因此变得极其无聊（这是褒义）：往对应目录丢一个 Markdown 文件，push，完事。

## 发布流程

GitHub Actions 负责剩下的事。推送到 `main` 之后，工作流自动构建并把产物丢给 Pages，几十秒后线上就更新了。我不需要在本地跑构建，也不需要 FTP。

```bash
git add . && git commit -m "new post" && git push
```

## 接下来想做的

- 接上 giscus 评论
- 给文章加阅读时长和目录
- 把老笔记陆续搬过来

先跑起来，剩下的慢慢长。
