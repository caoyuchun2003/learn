# 第13课 · Skills

## 本课目标

- 理解 Skill 是什么、何时触发
- 会读 `SKILL.md` 结构

## 13.1 Skill 是什么？

Skill 是带 **触发条件 + 操作步骤** 的能力包，Claude Code 在匹配任务时自动加载。

## 13.2 典型结构

```markdown
---
description: 何时应该用这个 skill（很重要，决定能否被触发）
---

# Skill 名称

## 步骤
1. ...
2. ...

## 注意事项
- ...
```

## 13.3 适合做成 Skill 的事

- 重复性高、流程固定
- 有检查清单
- 团队要统一做法

例如：写插件、配 Hook、做 code review、创建 PR。

## 13.4 学习资源

本地可参考：`code/cyc/claude-code/plugins/plugin-dev/skills/`

## 本课练习

读一个官方 Skill 的 `SKILL.md`，总结：description 怎么写？步骤有几层？

## 本课小结

> Skill = 可发现的 SOP。description 写得好，AI 才知道何时用它。

---

*作者：曹宇春 · Claude Code 学习方法*
