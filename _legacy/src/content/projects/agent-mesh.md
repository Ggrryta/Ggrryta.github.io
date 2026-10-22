---
title: "agent-mesh"
summary: "一个网关与技能包，让跨机器的 Claude Code 智能体能够互相协作、共享上下文。"
year: 2026
stack: ["TypeScript", "Node.js", "MCP"]
role: "设计与开发"
repo: "https://github.com/Ggrryta/agent-mesh"
featured: true
order: 1
---

多台机器上的编码智能体默认是信息孤岛：各自持有自己的上下文，谁也不知道对方在做什么。agent-mesh 想解决的就是这件事。

## 核心思路

- 一个轻量网关负责注册与发现，让每个智能体知道"还有谁在"
- 通过 MCP 暴露能力，把远程智能体的技能当作本地工具调用
- 任务可以拆分后分发，结果回传统一汇总

## 目前的进展

基础网关与技能包已经可用，能跑通跨机器的任务分发。接下来想补上权限控制与失败重试。
