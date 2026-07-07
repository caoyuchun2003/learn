# 第20课 · 自己写 Plugin

## 本课目标

- 了解插件目录结构
- 能从最小 slash command 起步

## 20.1 插件结构（概览）

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json      # 清单
├── commands/            # 斜杠命令
├── skills/              # Skills
├── agents/              # Agents
└── hooks/               # Hooks
```

## 20.2 学习路径

1. 读 `plugin-dev` 插件 README
2. 看 `minimal-plugin` 示例
3. 做一个只有 1 个 command 的插件
4. 逐步加 Skill / Hook

## 20.3 毕业项目

> 做「项目 onboarding」插件：  
> 运行后自动读 CLAUDE.md、列目录、跑测试、输出环境检查报告。

## 20.4 资源

- `code/cyc/claude-code/plugins/plugin-dev/`
- 官方文档：https://code.claude.com/docs/en/overview

## 本课练习

画出你想做的插件目录树（哪怕只有 1 个 command）。

## 本课小结

> 会写插件 = 把个人经验变成团队资产。

---

*作者：曹宇春 · Claude Code 学习方法*
