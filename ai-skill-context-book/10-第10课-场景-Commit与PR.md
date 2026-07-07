# 第10课 · 场景作战卡：Commit 与 PR

## 本课目标

- 清晰 Git 历史与 PR 描述
- 人确认后再提交

## Skill

- Conventional Commits
- PR 结构：**Summary + Test plan**
- 不自动 push，除非你明确要求

## Context

- `git diff --staged` 或分支 diff
- 关联 issue / 需求（如有）

## Feedback

- 你认可 commit message 后再 commit
- PR 描述可被 reviewer 直接照着测

## 开口模板

```
根据 staged 改动写 conventional commits 的 message，
先给我看，确认后再 commit。
```

```
对比 main...HEAD，写 PR 描述：Summary（3 条内）+ Test plan（ checklist）。
```

## 本课练习

让 AI 写一条 commit message，你改一版对比差异。

## 本课小结

> Git 文案也是 Skill——统一格式省团队沟通成本。

---

*作者：曹宇春 · AI 协作方法论*
