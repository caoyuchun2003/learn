# 第14课 · Hooks

## 本课目标

- 理解 Hook 在事件前后自动执行
- 知道典型使用场景

## 14.1 Hook 是什么？

在特定事件（如保存、提交、工具调用前后）自动跑脚本，用来：

- 统一 lint / format
- 阻止危险操作
- 自动记录日志

## 14.2 典型场景

| 场景 | Hook 做什么 |
|------|-------------|
| 提交前 | 跑测试、检查 commit message |
| 编辑后 | 自动 format |
| 危险命令 | 拦截 `rm -rf` |

## 14.3 学习资源

- 官方插件：`hookify`
- 本地：`code/cyc/claude-code/plugins/hookify/`

## 本课练习

想一个你希望「AI 永远不要忘记」的检查项，它适合做成 Hook 还是 Skill？

## 本课小结

> Hook 是护栏，Skill 是手册。护栏自动执行，手册按需查阅。

---

*作者：曹宇春 · Claude Code 学习方法*
