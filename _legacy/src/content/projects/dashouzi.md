---
title: "dashouzi"
summary: "用 Go 写的工具集合，偏向命令行下的日常自动化与批处理。"
year: 2025
stack: ["Go"]
role: "开发"
repo: "https://github.com/Ggrryta/dashouzi"
featured: true
order: 2
---

把日常重复性的命令行操作沉淀成小工具，编译成单文件二进制，丢到 PATH 里就能用。

## 设计取舍

- 不引入框架，标准库能解决的就不加依赖
- 每个子命令独立成文件，方便单独摘出去复用
- 输出尽量保持纯文本，方便管道给下一个命令
