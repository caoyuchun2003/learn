# Learn · 百度 CFC 函数

一期：**方案决策器**（规则引擎，不调大模型）。

方案全文见 [../docs/learn-cfc-方案.md](../docs/learn-cfc-方案.md)。

---

## 本地验证决策逻辑（不依赖云）

```bash
cd functions
node scripts/test-decide.cjs
```

## 部署到百度 CFC（BSAM CLI）

1. 开通 [函数计算 CFC](https://console.bce.baidu.com/cfc)，创建 Access Key。
2. 安装 CLI：

```bash
pip3 install bce-sam-cli
bsam config   # 填写 AK / SK / region（如 bj）
```

3. 部署（`Runtime` 若报错，按控制台当前支持的 Node 版本改 `template.yaml`）：

```bash
cd functions
bsam package
bsam deploy
```

4. 在控制台打开函数 → 触发器，复制 HTTP 地址，例如：

```text
https://xxxx.cfc-execute.bj.baidubce.com/api/decide
```

5. 本地或 CI 构建站点时设置：

```bash
export VITE_CFC_BASE=https://xxxx.cfc-execute.bj.baidubce.com
npm run docs:build
```

未设置 `VITE_CFC_BASE` 时，决策页使用 **浏览器内嵌同一套规则**（离线可用）。

## 环境变量

| 变量 | 默认 | 含义 |
|------|------|------|
| `FEATURE_DECIDE` | `on` | `off` 关闭接口 |
| `CORS_ORIGIN` | `https://caoyuchun2003.github.io` | 允许的前端源 |
| `RATE_LIMIT_PER_MIN` | `30` | 每 IP 每分钟次数 |

## curl 示例

```bash
curl -s -X POST "$VITE_CFC_BASE/api/decide" \
  -H 'Content-Type: application/json' \
  -d '{"stepsFixed":"yes","textOnly":"yes","knowledgeInDocs":"yes","needHumanInLoop":"yes"}'
```
