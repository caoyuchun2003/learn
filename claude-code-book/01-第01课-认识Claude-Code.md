# 第01课 · 认识 Claude Code

## 本课目标

- 知道 Claude Code 是什么、能干什么
- 分清它和 ChatGPT、Cursor 的区别
- 建立正确预期

## 1.1 它是什么？

Claude Code 是 Anthropic 出品的 **Agent 型编程工具**：

| 特点 | 说明 |
|------|------|
| 住在终端 | `cd 项目 && claude` 即可开始 |
| 能动手 | 读/写文件、跑 shell、处理 Git |
| 懂项目 | 可扫描整个代码库 |
| 可扩展 | Skills、Hooks、Plugins、MCP |

## 1.2 和 ChatGPT / Cursor 怎么选？

| 工具 | 强项 | 弱项 |
|------|------|------|
| ChatGPT | 通用问答、学习概念 | 不直接改本地代码 |
| Cursor | IDE 内编码、可视化 diff | 偏图形界面 |
| Claude Code | 终端 Agent、Git 流、自动化 | 需习惯命令行 |

三者可组合使用，不是非此即彼。

## 1.3 三个核心概念

```
模型（大脑）+ 工具（读/写/跑）+ 上下文（项目信息）= Agent
```

- **模型**：推理与生成
- **工具**：读文件、grep、bash、编辑代码
- **上下文**：对话 + @ 文件 + CLAUDE.md

## 1.4 适合与不适合

**✅ 适合：** 加功能、修 bug、写测试、解释代码、Git 工作流

**❌ 不适合：** 不看 diff 全盘接受、无测试就信它、把密钥交给它

## 本课练习

1. 列出你想用 Claude Code 解决的 3 个问题
2. 浏览官方文档 Overview 10 分钟

## 本课小结

> Claude Code = 终端里的 AI 同事。它会动手，但需要你指挥和验收。

---

*作者：曹宇春 · Claude Code 学习方法*
