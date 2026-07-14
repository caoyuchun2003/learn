#!/usr/bin/env bash
# 用本机环境变量注入 QIANFAN_AK 后 bsam package + deploy（Key 不写进 Git）
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v bsam >/dev/null 2>&1; then
  echo "未找到 bsam。先安装并配置："
  echo "  pip3 install bce-sam-cli"
  echo "  bsam config"
  exit 1
fi

BASE_TEMPLATE="${ROOT}/template.yaml"
DEPLOY_TEMPLATE="${ROOT}/template.deploy.yaml"
trap 'rm -f "$DEPLOY_TEMPLATE"' EXIT

if [[ -n "${QIANFAN_AK:-}" ]]; then
  # 在 Environment.Variables 下注入/覆盖 QIANFAN_AK（不修改仓库内 template.yaml）
  python3 - "$BASE_TEMPLATE" "$DEPLOY_TEMPLATE" <<'PY'
import os, re, sys
src, dst = sys.argv[1], sys.argv[2]
text = open(src, encoding="utf-8").read()
ak = os.environ["QIANFAN_AK"]
# 转义 YAML 单引号
ak_esc = ak.replace("'", "''")
line = f"          QIANFAN_AK: '{ak_esc}'\n"
if re.search(r"^\s*QIANFAN_AK:\s*", text, re.M):
    text = re.sub(r"^\s*QIANFAN_AK:\s*.*$", line.rstrip(), text, count=1, flags=re.M)
else:
    # 插在 QIANFAN_MODEL 上一行附近
    if "QIANFAN_MODEL:" in text:
        text = text.replace(
            "          QIANFAN_MODEL:",
            line + "          QIANFAN_MODEL:",
            1,
        )
    else:
        text = text.replace(
            "          RATE_LIMIT_PER_MIN:",
            line + "          RATE_LIMIT_PER_MIN:",
            1,
        )
open(dst, "w", encoding="utf-8").write(text)
print("已生成 template.deploy.yaml（含 QIANFAN_AK，不入库）")
PY
  TPL=(-t "$DEPLOY_TEMPLATE")
  echo "部署将带上 QIANFAN_AK（长度 ${#QIANFAN_AK}）"
else
  echo "未设置 QIANFAN_AK：将只部署规则/检索（不调千帆）。"
  echo "  export QIANFAN_AK='你的千帆APIKey'"
  echo "  再重新执行本脚本即可写入环境变量。"
  TPL=()
fi

echo ">>> bsam package"
bsam package "${TPL[@]}"
echo ">>> bsam deploy"
bsam deploy "${TPL[@]}"

echo
echo "部署完成。下一步："
echo "  1) 在控制台复制 HTTP 触发器根地址（https://xxx.cfc-execute....）"
echo "  2) 设 GitHub Secret："
echo "       gh secret set VITE_CFC_BASE --repo caoyuchun2003/learn --body 'https://你的地址'"
echo "     或运行：./scripts/set-github-cfc-secret.sh 'https://你的地址'"
echo "  3) curl 探活：curl -s \"\$VITE_CFC_BASE\""
