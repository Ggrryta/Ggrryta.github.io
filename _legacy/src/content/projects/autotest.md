---
title: "autotest"
summary: "Python 写的自动化测试脚手架，用来快速拉起回归测试与报告。"
year: 2025
stack: ["Python", "pytest"]
role: "开发"
repo: "https://github.com/Ggrryta/autotest"
featured: false
order: 3
---

目标很直接：让"跑一遍回归"这件事不需要记命令。

## 做了什么

- 统一入口封装常用参数，避免每次手敲一长串
- 用例按目录自动发现，新增用例不用改配置
- 失败用例单独汇总输出，减少翻日志的时间
