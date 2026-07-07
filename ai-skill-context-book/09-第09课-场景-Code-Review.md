# 第09课 · 场景作战卡：Code Review

## 本课目标

- AI 当初筛，人做终审
- 固定 review 维度

## Skill

- 四维度：**正确性、简洁性、一致性、测试与安全**
- **只列问题，先不改代码**
- 按严重程度排序

## Context

- `git diff main...HEAD` 或 PR diff
- PR 描述 / 需求背景
- 项目规范（CLAUDE.md）

## Feedback

- 问题清单可执行
- 你人工确认后再 merge

## 开口模板

```
Review 当前分支相对 main 的改动：
1. 明显 bug
2. 过度设计
3. 测试是否够
4. 安全风险
按严重程度高→低列问题，先别改代码。
```

## 本课练习

对一次真实 diff 做 review，标出 AI 漏掉的 1–2 点。

## 本课小结

> Review 的 Feedback 是人审，不是 AI 说 OK 就 OK。

---

*作者：曹宇春 · AI 协作方法论*
