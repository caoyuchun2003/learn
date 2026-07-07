# 第08课 · CLAUDE.md

## 本课目标

- 会写项目根目录的 `CLAUDE.md`
- 让 AI 持久「懂」你的项目规范

## 8.1 它是什么？

`CLAUDE.md` 是项目的 **AI 员工手册**，每次对话 Claude Code 会优先读取。

## 8.2 模板

```markdown
# 项目说明

## 技术栈
- Node 22, TypeScript, Next.js 15

## 常用命令
- 安装: pnpm install
- 测试: pnpm test
- 构建: pnpm build

## 代码规范
- 用 named export
- 新功能必须加测试

## 禁止
- 不要改 .env
- 不要升级 major 依赖除非我要求
```

## 8.3 写什么？

- 技术栈与版本
- 目录结构说明
- 测试/构建命令
- 命名与代码风格
- 明确禁止事项

## 本课练习

给你当前项目写一份 30 行以内的 `CLAUDE.md`。

## 本课小结

> CLAUDE.md 写一次，省无数次重复交代。

---

*作者：曹宇春 · Claude Code 学习方法*
