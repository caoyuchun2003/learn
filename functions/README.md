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

## 1. 安装并登录 BSAM

```bash
pip3 install bce-sam-cli
bsam config          # 填百度云 AK/SK、地域
```

## 2. CLI 配置 `QIANFAN_AK` 并部署

Key **不要**写进 `template.yaml` / 不要提交 Git。用环境变量 + 脚本注入临时模板：

```bash
cd functions

# 千帆 API Key（控制台创建）
export QIANFAN_AK='你的千帆APIKey'

chmod +x scripts/deploy.sh scripts/set-github-cfc-secret.sh
./scripts/deploy.sh
```

脚本会生成（并自动删除）`template.deploy.yaml`，再执行 `bsam package` / `bsam deploy`。

未 export `QIANFAN_AK` 时也能部署：决策器 + 检索可用，但不调千帆。

| 变量 | 说明 |
|------|------|
| `QIANFAN_AK` | 千帆 API Key（Bearer）；仅本机/CFC，**勿提交** |
| `QIANFAN_MODEL` | 默认在 template 里：`ernie-4.0-8k` |
| `FEATURE_ASK` / `FEATURE_DECIDE` | `on` / `off` |
| `CORS_ORIGIN` | 默认 `https://caoyuchun2003.github.io` |

也可用 `cp .env.example .env.local`，编辑后 `set -a; source .env.local; set +a`，再跑 `./scripts/deploy.sh`。

## 3. 接到 GitHub Pages（`VITE_CFC_BASE`）

1. 在 CFC 控制台复制 **HTTP 触发器根地址**，例如  
   `https://xxxx.cfc-execute.bj.baidubce.com`（不要带 `/api/ask`）
2. 用 gh CLI 写 Secret（推荐）：

```bash
./scripts/set-github-cfc-secret.sh 'https://xxxx.cfc-execute.bj.baidubce.com'
```

或网页：仓库 → Settings → Secrets and variables → Actions → `VITE_CFC_BASE`。

3. 重新跑 Actions 里的 `Deploy VitePress`（或再 push 一次）。

## curl 自检

```bash
export VITE_CFC_BASE='https://xxxx.cfc-execute.bj.baidubce.com'

curl -s "$VITE_CFC_BASE"   # hasQianfanKey 应为 true

curl -s -X POST "$VITE_CFC_BASE/api/ask" \
  -H 'Content-Type: application/json' \
  -d '{"question":"阅读器要不要上 Agent","scope":"agent-book"}'
```

未配置前端 Secret 时：决策器 / 问本站仍在浏览器降级。
