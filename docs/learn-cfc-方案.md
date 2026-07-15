# Learn × 百度云函数计算（CFC）方案

> 静态书库（GitHub Pages）+ Serverless API（百度 CFC）  
> **先打通非 AI 能力，再按需加「问手册」AI。**  
> 作者：曹宇春 · 状态：**一、二期代码已落地**（决策器 + 问本站；本地可降级；CFC / 千帆待你部署与配 Key）· 2026-07

---

## 1. 背景与目标

### 1.1 现状

| 项 | 现状 |
|----|------|
| 站点 | VitePress → GitHub Pages（`https://learn.yuchuntest.com`，`base: '/'`） |
| 内容 | 多本 Markdown 手册（AI / Agent / OS / …） |
| 后端 | 无 |
| 约束 | 个人开发、希望少备案；Key 不能进前端 |

### 1.2 目标

1. 用 **CFC 默认 HTTPS 域名** 提供 API（不绑自有域名、不备案）。
2. 证明架构：**Pages（HTTPS）→ CFC（HTTPS）**，无混合内容问题。
3. 功能分两档：
   - **非 AI**：方案决策器（规则引擎）——优先落地、零模型费用。
   - **AI（可选二期）**：「问本站」千帆代理 + 轻量摘录检索。
4. 助手/API 挂掉时，**静态阅读不受影响**。

### 1.3 非目标（本期不做）

- 用户登录 / 付费墙 / 完整 CMS  
- 真向量库、多智能体、Computer Use  
- 国内自有域名备案、微信小程序业务域名  

---

## 2. 总体架构

```
用户浏览器
    │
    ├─ 静态页 ──► GitHub Pages
    │              https://caoyuchun2003.github.io/learn/
    │
    └─ API ──────► 百度 CFC（HTTP 触发器）
                   https://{id}.cfc-execute.{region}.baidubce.com
                        │
                        ├─ /api/decide  → 规则引擎（无模型）
                        └─ /api/ask     → 千帆（二期，环境变量藏 Key）
```

| 层 | 职责 |
|----|------|
| Pages | 书库 +「工具」页 + 可选浮动入口 |
| CFC | 鉴权/限流/CORS/业务逻辑；**不存长期会话状态（V1）** |
| 千帆 | 仅 `/api/ask` 使用 |

部署：

- 前端：现有 GitHub Actions → Pages  
- 函数：本地 **BSAM CLI**（`bsam deploy`）或控制台；日常以 CLI 为准  

---

## 3. 功能设计

### 3.1 分期

| 期次 | 功能 | 是否 AI | 优先级 |
|------|------|---------|--------|
| **一期 MVP** | 方案决策器 + CORS + 开关 + 限流 | ❌ | ✅ 已实现 |
| **二期** | 问本站（千帆代理 + 课目录/导读摘要） | ✅ | ✅ 已实现（无 Key 时仅检索） |
| **三期** | 手册助教对话 + SSE/假流式 + 全站抽屉 + 简单反馈 | ✅ | ✅ 已实现（摘要加厚仍可后续） |

---

### 3.2 一期：方案决策器（非 AI）

**用户故事：**  
作为读者，我在表单里回答 4～5 个问题，网站告诉我更适合 Workflow、RAG 还是 Agent，并链到站内对应课文。

**入口页面：** `/tools/ai-decision`（VitePress 新建一页）

**问卷字段（V1）：**

| 字段 | 含义 | 取值 |
|------|------|------|
| `stepsFixed` | 步骤能否预先写死 | `yes` / `no` |
| `textOnly` | 是否只要文本问答 | `yes` / `no` |
| `knowledgeInDocs` | 知识是否在文档/教材库 | `yes` / `no` |
| `needHumanInLoop` | 高风险是否需要人在环 | `yes` / `no` |

**决策规则（写死在 CFC，可单测）：**

```
if stepsFixed=yes && textOnly=yes && knowledgeInDocs=yes
  → Workflow + RAG
  → 链接：agent-book 第01课、AI手册 第3/16课

if stepsFixed=yes && textOnly=no
  → Workflow + 单次 Function Calling（先别上自主 Agent）
  → 链接：agent-book 第03课、第07课

if stepsFixed=no && textOnly=no
  → 可考虑自主 Agent + 沙箱审批
  → 链接：agent-book 第06课、AI手册 第4/16课

默认 / 边界
  → 提示「先简单后复杂」+ 导读链接
```

（细则实现时可做成决策表，避免嵌套 if 难维护。）

**接口：`POST /api/decide`**

Request：

```json
{
  "stepsFixed": "yes",
  "textOnly": "yes",
  "knowledgeInDocs": "yes",
  "needHumanInLoop": "yes",
  "client": "learn-web"
}
```

Response：

```json
{
  "recommend": "Workflow + RAG",
  "avoid": "自主 Agent",
  "reasons": ["步骤可写死", "只要文本问答", "知识在库内"],
  "links": [
    {
      "title": "第 01 课 · 教材阅读器要不要上 Agent？",
      "path": "/learn/agent-book/01-第01课-教材阅读器要不要上Agent.html"
    }
  ],
  "requestId": "..."
}
```

---

### 3.3 二期：问本站（AI）

**用户故事：**  
用自然语言提问，得到简短回答 + 2～5 条站内链接；手册没写的内容明确说「未覆盖」。

**入口：** `/tools/ask`（VitePress）；未配置 CFC / 千帆时仅关键词检索。

**接口：`POST /api/ask`**

Request：

```json
{
  "question": "阅读器 V1 要不要上 Agent？",
  "scope": "agent-book",
  "client": "learn-web"
}
```

Response：

```json
{
  "answer": "……",
  "refs": [
    {
      "title": "……",
      "path": "/learn/agent-book/…",
      "snippet": "……"
    }
  ],
  "model": "…",
  "requestId": "…"
}
```

**检索 V1（不做向量库）：**

- 维护 `manifest.json`：书 → 课标题 → 导读/摘要片段 → 站内 path  
- 关键词 / 简单打分取 TopK 片段塞进 prompt  
- System：只根据摘录回答；必须输出可映射的 ref  

**密钥：** `QIANFAN_AK` 仅存在 CFC 环境变量。

---

### 3.4 公共能力（两期共用）

| 能力 | 说明 |
|------|------|
| CORS | 允许 `https://caoyuchun2003.github.io`；本地可选 `http://localhost:5173` |
| OPTIONS | 预检直接 204 |
| `FEATURE_DECIDE` / `FEATURE_ASK` | `on`/`off` |
| 限流 | 同 IP 粗粒度计数（进程内即可，重启清零可接受） |
| 错误码 | `BAD_REQUEST` / `RATE_LIMIT` / `DISABLED` / `UPSTREAM` |

前端：未配置 `VITE_CFC_BASE` 时，决策器 / 问本站均在浏览器降级；功能关闭（`FEATURE_*=off`）时云端返回 503。

GitHub Actions：`secrets.VITE_CFC_BASE` 注入构建（见 `.github/workflows/docs.yml`）。

---

## 4. 目录与仓库布局

```
learn/
├── docs/
│   └── learn-cfc-方案.md
├── tools/
│   ├── ask.md                 # 问本站
│   └── ai-decision.md         # 方案决策器
├── functions/                 # CFC（BSAM）
│   ├── template.yaml
│   ├── README.md
│   ├── data/manifest.json
│   └── src/
│       ├── index.js           # /api/decide + /api/ask
│       ├── decideEngine.cjs
│       ├── retrieve.cjs
│       └── askQianfan.cjs
└── .vitepress/config.ts       # 导航「工具」
```

前端构建环境变量（仅 URL，勿写 Key）：

```bash
VITE_CFC_BASE=https://xxxx.cfc-execute.bj.baidubce.com
```

---

## 5. CFC 部署方案

### 5.1 推荐：BSAM CLI

```bash
pip3 install bce-sam-cli
bsam config          # AK/SK、地域
cd functions
bsam package
bsam deploy          # 创建或更新函数 + template 中的 HTTP 触发器
```

### 5.2 template.yaml 要点（示意）

- Runtime：以控制台当前支持的 Node 版本为准  
- `DecideFunction` → Events.Http → Path `/api/decide`，Methods `POST,OPTIONS`，Auth `anonymous`（上线后可加简易 Token）  
- `AskFunction`（二期）→ `/api/ask`  
- Environment：`FEATURE_*`、`CORS_ORIGIN`、二期 `QIANFAN_AK`  

### 5.3 与控制台关系

| 事项 | 方式 |
|------|------|
| 首次开通 CFC、创建 AK | 控制台一次 |
| 日常发版 | **CLI `bsam deploy`** |
| 看日志 / 临时开关 | 控制台或改环境变量再 deploy |

---

## 6. 安全与合规

| 风险 | 对策 |
|------|------|
| Key 泄露 | 禁止写入仓库；仅 CFC 环境变量 |
| 接口被刷 | 限流 + 后期简单 `x-learn-token` |
| 跨域滥用 | CORS 白名单，避免长期 `*` |
| AI 幻觉（二期） | 强制摘录 + 拒答策略；回答附 refs |
| 备案 | 使用 CFC **平台域名**，不绑自有域 |

---

## 7. 验收标准

### 一期 MVP（代码侧）

- [x] `decide` 引擎 + 本地单测；前端 `/tools/ai-decision` 可本地降级  
- [ ] 你侧：`bsam deploy` 后 `POST /api/decide` curl 通  
- [ ] Network 面板无百度千帆 Key  
- [ ] `FEATURE_DECIDE=off` 时接口 503  

### 二期（代码侧）

- [x] `manifest` + `retrieve` + `/api/ask` + `/tools/ask`（无 Key 仅检索）  
- [ ] 你侧：CFC 配 `QIANFAN_AK`，生成回答 + ≥1 条站内链  
- [ ] 手册未覆盖类问题不编造课名  
- [ ] `FEATURE_ASK=off` 可单独关闭  

---

## 8. 你侧待办（代码已齐）

1. `cd functions && bsam config && bsam package && bsam deploy`  
2. CFC 控制台设 `QIANFAN_AK`（勿提交仓库）  
3. GitHub Secrets 设 `VITE_CFC_BASE` = CFC HTTPS 基础 URL  
4. 推送后确认 Pages「问本站 / 决策器」走云端  

---

## 9. 成本粗估（个人）

| 项 | 一期 | 二期 |
|----|------|------|
| CFC | 极低（规则计算） | 随提问次数上升 |
| 千帆 | 0 | Token 为主 |
| Pages | 免费 | 免费 |

---

## 10. 决策结论

| 问题 | 结论 |
|------|------|
| learn 要不要加 CFC？ | **要，小步**：先做非 AI 决策 API |
| 是不是全是 AI？ | **否**；一期零模型；二期可选千帆 |
| 能否 CLI 部署？ | **能**（BSAM CLI） |
| 要备案吗？ | **不需要**（平台域名） |

---

*本文为工程方案，随实现可修订版本号。*
