# Learn · 百度 CFC 函数

| 接口 | 说明 | 是否 AI |
|------|------|---------|
| `POST /api/decide` | 方案决策器（规则） | ❌ |
| `POST /api/ask` | 问本站（检索 + 可选千帆） | ✅ 可选 |

方案：[../docs/learn-cfc-方案.md](../docs/learn-cfc-方案.md)

---

## 本地验证（不依赖云）

```bash
cd functions
node scripts/test-decide.cjs
node scripts/test-retrieve.cjs
```

## 部署（BSAM CLI）

```bash
pip3 install bce-sam-cli
bsam config
cd functions
bsam package
bsam deploy
```

在控制台为函数配置环境变量（或改 `template.yaml` 后重新 deploy）：

| 变量 | 说明 |
|------|------|
| `QIANFAN_AK` | 千帆 API Key（Bearer）；**不要提交仓库** |
| `QIANFAN_MODEL` | 默认 `ernie-4.0-8k`，可按账号可用模型改 |
| `FEATURE_ASK` / `FEATURE_DECIDE` | `on` / `off` |
| `CORS_ORIGIN` | 默认 `https://caoyuchun2003.github.io` |

## 接到 GitHub Pages

1. 复制触发器基础 URL，例如 `https://xxxx.cfc-execute.bj.baidubce.com`（不要末尾路径，或两种都试）  
2. 在 GitHub 仓库 **Settings → Secrets → Actions** 新增：

   `VITE_CFC_BASE` = 该 URL  

3. 推送或手动跑 `Deploy VitePress` workflow。

未配置时：决策器 / 问本站均在浏览器内降级（规则或关键词检索）。

## curl

```bash
# 决策
curl -s -X POST "$VITE_CFC_BASE/api/decide" \
  -H 'Content-Type: application/json' \
  -d '{"stepsFixed":"yes","textOnly":"yes","knowledgeInDocs":"yes","needHumanInLoop":"yes"}'

# 提问
curl -s -X POST "$VITE_CFC_BASE/api/ask" \
  -H 'Content-Type: application/json' \
  -d '{"question":"阅读器要不要上 Agent","scope":"agent-book"}'
```
