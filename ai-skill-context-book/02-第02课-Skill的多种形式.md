# 第02课 · Skill 的多种形式

## 本课目标

- 理解 Skill 是广义「能力模块」
- 分清 Skill、Slash Command、CLAUDE.md 的异同

## 2.1 Skill 不限于 SKILL.md

| 形式 | 是什么 | 怎么触发 |
|------|--------|----------|
| 正式 Skill | `skills/xxx/SKILL.md` | Claude 自动匹配 description |
| Slash Command | `commands/xxx.md` | 你输入 `/xxx` |
| CLAUDE.md | 项目规范 | 每次对话自动读 |
| 角色设定 | 「你是 Laravel 专家」 | 写在 prompt 里 |
| 个人模板 | 调试四步、review 规范 | 你复制粘贴 |
| MCP / 工具 | 查语雀、跑测试 | Agent 调用 |

**都是 Skill**——可被复用的「怎么做」。

## 2.2 Command vs 正式 Skill

| | Slash Command | 正式 Skill |
|---|---------------|------------|
| 触发 | 你手动 `/` | AI 自动匹配 |
| 厚度 | 通常一个 md | 可有 scripts、references |
| 类比 | 快捷键 | 自动推荐专家 |

两者都是能力包装；Command 是**显式 API**，Skill 是**隐式 API**。

## 2.3 怎么选？

| 情况 | 用 |
|------|-----|
| 每次主动跑固定流程 | Command |
| 希望聊到某话题自动变专业 | Skill |
| 项目全员遵守的规范 | CLAUDE.md |
| 只有几段话 | 个人模板即可 |

## 本课练习

列出你常用的 3 个「能力」，分别该做成 Command、Skill 还是 CLAUDE.md。

## 本课小结

> Skill 是模块；Command 是手动调用的薄模块，正式 Skill 是自动匹配的可扩展模块。

---

*作者：曹宇春 · AI 协作方法论*
