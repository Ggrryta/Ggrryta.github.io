---
title: "Astro Content Collections 使用笔记"
description: "定义 schema、查询条目、渲染正文，以及几个容易踩的坑。"
pubDate: 2026-10-20
tags: ["Astro", "TypeScript"]
---

Content Collections 是 Astro 里我最喜欢的部分：它把散落的 Markdown 变成**类型安全的数据源**。

## 定义

在 `src/content.config.ts` 里声明 collection，用 Zod 描述字段。写错字段名或者漏了必填项，构建时直接报错，而不是等到页面上出现 `undefined`。

## 查询

```ts
import { getCollection } from 'astro:content';

const posts = await getCollection('blog', ({ data }) => !data.draft);
```

第二个参数是过滤器，`draft: true` 的文章不会出现在正式构建里，适合存半成品。

## 渲染

详情页里拿到 entry 之后调用 `render()`，再用 `<Content />` 组件输出正文：

```astro
---
const { post } = Astro.props;
const { Content } = await render(post);
---
<article><Content /></article>
```

## 几个坑

- 条目排序要自己做，`getCollection` 不保证顺序，按 `pubDate` 排一遍最稳妥。
- `entry.id` 是相对 base 目录的路径（不含扩展名），有子目录时会带 `/`。
- 标签去重别用嵌套循环，`Set` 一行搞定。
