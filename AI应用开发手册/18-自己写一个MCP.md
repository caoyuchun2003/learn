## 十八、自己写一个 MCP ⭐ 让 AI 操作你的系统

> **写 MCP = 把你的业务能力(查数据/发通知)封装成"AI 能调用的标准工具"。** 核心功夫在"把工具描述写清楚"。

### MCP 暴露三样
Tools(工具,最常用,AI主动调)· Resources(只读数据)· Prompts(提示模板)。

### 结构
```
① 声明工具(名字+description+参数schema)
② 等 AI 调用(JSON-RPC,stdio当子进程)
③ 收到调用 → 执行你的逻辑 → 返回
```

### ⭐ 关键:工具描述写好
AI 靠 description 和参数说明判断"何时用、怎么调"(=给AI看的提示工程)。
```
❌ "get data"
✅ "查询指定班级某周作业提交情况,返回未交人数和名单,当用户问作业完成情况时使用"
```

### 网校 MCP 例子
get_student_info · get_homework_status · send_notification · get_exam_stats · list_classes
→ Cursor/Claude 里自然语言就能操作网校后台("查完成率最低的班,给没交的发提醒")。

### 安全(必须,呼应第13课)
权限最小化 · 安全模式(readonly/limited/full)· 危险操作审批 · 鉴权 · 参数校验防越权 · 敏感数据脱敏。

### MCP vs 直接function calling
MCP=想让通用客户端(Cursor/Claude)跨端复用你的工具;只在自己应用内用 → 直接tool calling更简单。

---
