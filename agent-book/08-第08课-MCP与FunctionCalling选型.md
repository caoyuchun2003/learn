# 第 08 课 · MCP 与 Function Calling 选型

> **都是「让模型调你的函数」,区别在「给谁调、跨不跨端」。**
> MCP 不是更高级的 Function Calling,而是把它 **标准化**,好让通用客户端复用。

---

## 本课要解决的问题

上一课把工具设计和安全讲清了。落地时会遇到一个选型岔路:

> 我这些工具,是直接用 **Function Calling** 接进自己的应用,还是封装成 **MCP** 服务?

选错了要么白白增加复杂度,要么错失复用价值。

---

## 一、先理清关系

```
Function Calling:模型 API 的能力 —— 让模型「续写」出「调用 xxx(参数)」,你的程序执行后把结果拼回。
MCP(Model Context Protocol):一套标准协议 —— 把「有哪些工具、怎么调用」标准化,
                              让任意支持 MCP 的客户端(Cursor / Claude 等)都能发现并调用你的工具。
```

> 一句话:**Function Calling 是「模型会调函数」;MCP 是「把函数按统一标准暴露出去,谁都能来调」。**

---

## 二、MCP 暴露三样东西

| 类型 | 是什么 | 例子 |
|------|--------|------|
| **Tools** | AI 主动调用的工具(最常用) | `get_homework_status`、`send_notification` |
| **Resources** | 只读数据源 | 班级列表、课程大纲 |
| **Prompts** | 可复用的提示模板 | 「生成学情报告」模板 |

MCP 服务的骨架:

```
① 声明工具(名字 + description + 参数 schema)
② 等客户端调用(JSON-RPC;本地常以 stdio 子进程形式)
③ 收到调用 → 执行你的业务逻辑 → 返回结构化结果
```

---

## 三、选型:一张表拍板

| 你的情况 | 选 |
|----------|-----|
| 工具只在 **自己的应用内** 用 | **直接 Function Calling**(更简单,少一层) |
| 想让 **Cursor / Claude 等通用客户端** 也能调 | **MCP**(标准化,跨端复用) |
| 想把网校后台能力开放给 **多个 AI 前端 / 团队** 复用 | **MCP** |
| 快速验证一个功能、就一处用 | **Function Calling** 先跑起来 |

**决策口诀:**

```
只有自己应用调 → Function Calling
要被通用客户端 / 多方复用 → MCP
先 Function Calling 跑通,确有复用需求再抽成 MCP
```

> **别为了「显得先进」上 MCP。** 单应用内部用,直接 Function Calling 更省事;MCP 的价值是 **跨客户端复用**。

---

## 四、网校 MCP 例子

把网校后台能力封装成一组 MCP 工具:

```
get_student_info      查学员基本信息
get_homework_status   查作业提交情况
get_exam_stats        查考试统计
list_classes          列出班级
send_notification     发通知(写操作,须审批)
```

接好后,在 Cursor / Claude 里就能用 **自然语言** 操作后台:

> 「查一下完成率最低的班,给没交作业的学员发个提醒。」

模型自动:`list_classes` → `get_homework_status` → `send_notification`(每个写操作弹审批)。

---

## 五、无论选哪个,安全一视同仁

MCP 和 Function Calling 的安全要求 **完全一致**(见第 07 课):

```
权限最小化 · 安全模式(readonly / limited / full)· 危险操作审批
鉴权 · 参数校验防越权 · 敏感数据脱敏
```

> MCP 把工具「开放」给更多客户端,反而 **更要收紧权限和审批** —— 暴露面变大了。

---

## 本课结论

1. **Function Calling = 模型会调函数;MCP = 把函数按标准暴露,供通用客户端复用。**
2. **只在自己应用内用 → Function Calling;要跨端 / 多方复用 → MCP。**
3. **MCP 暴露 Tools / Resources / Prompts**,关键仍是把 description 写清。
4. **先 Function Calling 跑通,确有复用需求再抽 MCP。**
5. **安全要求两者一致**,MCP 暴露面更大,权限审批更要严。

---

## 课后自检(3 分钟)

- [ ] 我清楚这套工具是「自己应用内用」还是「要跨端复用」
- [ ] 单应用场景我没有为了先进而硬上 MCP
- [ ] 无论哪种,我的工具 description 和参数 schema 都写清了
- [ ] 写操作有审批,参数有后端校验
- [ ] 若用 MCP,我按暴露面更大收紧了权限

---

## 下一课预告

**第 09 课 · 记忆、多轮与上下文** —— 模型天生失忆,怎么让它记住学员、管好多轮对话、不撑爆窗口。

---

## 延伸阅读

- [第 07 课 · 工具设计与安全](07-第07课-工具设计与安全.md)
- [AI 应用开发手册 · 第 18 课 自己写一个 MCP](../AI应用开发手册/18-自己写一个MCP.md)
- [AI 应用开发手册 · 第 4 课 Agent](../AI应用开发手册/04-Agent智能体.md)

---

*© 曹宇春*
