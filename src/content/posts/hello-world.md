---
author: Ggrryta
pubDatetime: 2026-10-22T12:00:00+08:00
modDatetime: 2026-10-23T12:00:00+08:00
title: "这个站点是怎么搭起来的"
featured: true
draft: false
tags:
  - Astro
  - GitHub Pages
  - 踩坑记录
description: "用 AstroPaper + GitHub Pages 搭一个个人博客，以及中途被推翻的几次方案。"
---

折腾个人站这件事，我反复推翻过好几次方案。最后定下来的是 **Astro + GitHub Pages**，理由很简单：静态站够快、够省心，而我只想安安静静写东西。

## 为什么不自己造了

一开始我是从零搭的：自己写 layout、自己写样式、自己定义两套内容 schema。跑是跑起来了，但很快发现一个尴尬的事实——我要的绝大部分东西，成熟主题里早就有现成的：

- 全文搜索（Pagefind）
- 分页、归档、标签页
- 文章目录
- 动态 OG 图
- 深浅色切换
- RSS、sitemap、SEO 与无障碍

这些东西单独拿出来的每一个都不难，但**一件件自己设计和实现，就是在重复别人的劳动**。真正必须自己动手的，其实只有「文章互链」那部分——几乎没有博客主题提供 wikilink 和反向链接，那是数字花园的需求，不是博客的需求。

所以我换成了 [AstroPaper](https://github.com/satnaing/astro-paper)，自己写的那部分先备份起来，等文章多到真的需要互链了再移植过去。站在别人肩膀上不丢人，重复造轮子才浪费时间。

## 作品集拆出去了

再早一点的方案是「作品集 + 博客合体」。作品是卡片式的——封面、技术栈、外链；文章是线性的——标题、日期、正文。塞进同一套模板里迟早要打架。

后来想通了：这俩本来就不必在一起。作品集独立成站，博客这边只要一个 [关于页](/about) 放个链接指过去就够了。约束一解开，选主题的余地反而大了很多——之前卡在「必须同时支持作品集」上的选项全都能用了。

## 内容怎么组织

Astro 的 Content Collections 负责把内容约束住，现在只需要一套：

```ts
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({ /* 文章字段 */ }),
});
```

新增内容的方式因此变得极其无聊（这是褒义）：往对应目录丢一个 Markdown 文件，push，完事。schema 的具体写法我单独拆了一篇 [Astro Content Collections 使用笔记](/posts/content-collections-notes)。

## 发布流程

GitHub Actions 负责剩下的事。推送到 `main` 之后，工作流自动构建并把产物丢给 Pages，几十秒后线上就更新了。我不需要在本地跑构建，也不需要 FTP。

```bash
git add . && git commit -m "new post" && git push
```

## 踩到的坑

**Google 字体会让构建失败。** AstroPaper 默认在构建时从 Google Fonts 拉一个字体用来生成 OG 图。本地没外网直接报错，更麻烦的是那个字体没有中文字形——就算拉成功了，中文标题也会渲染成一堆方块。解决办法是关掉动态 OG 图，用一张静态图代替。

**备份目录会被类型检查扫进去。** 我把旧代码放在 `_legacy/` 留着，结果 `astro check` 把它也检查了，报了一堆「重复声明」——里面有一份模板的完整副本。在 `tsconfig.json` 的 `exclude` 里加上就好了。

## 接下来想做的

- 接上 giscus 评论
- 把作品集站真正建起来
- 文章多起来之后，把互链层移植过来

先跑起来，剩下的慢慢长。
