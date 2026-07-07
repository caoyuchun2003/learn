# 第10课 · Code Review

## 本课目标

- 让 Claude Code 当「第二双眼睛」
- 学会 review 话术

## 10.1 Review 话术

```
Review 我当前分支相对 main 的改动：
1. 有没有明显 bug
2. 有没有过度设计
3. 测试是否够
按严重程度列问题，先别改代码。
```

## 10.2 Review 维度

| 维度 | 问什么 |
|------|--------|
| 正确性 | 逻辑对吗？边界 case？ |
| 简洁性 | 有没有过度抽象？ |
| 一致性 | 符合项目风格吗？ |
| 测试 | 关键路径有覆盖吗？ |
| 安全 | 有注入/泄露风险吗？ |

## 10.3 官方插件

GitHub `anthropics/claude-code` 仓库有 `code-review`、`pr-review-toolkit` 插件可参考。

## 本课练习

对一个真实 diff 做 review，挑 2 个它漏掉的问题。

## 本课小结

> AI review 是初筛，人不能省。但它能帮你少漏明显问题。

---

*作者：曹宇春 · Claude Code 学习方法*
