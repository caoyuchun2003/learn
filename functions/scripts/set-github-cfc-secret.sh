#!/usr/bin/env bash
# 把 CFC HTTP 根地址写入 GitHub Actions Secret：VITE_CFC_BASE
set -euo pipefail

REPO="${GITHUB_REPO:-caoyuchun2003/learn}"
URL="${1:-}"

if [[ -z "$URL" ]]; then
  echo "用法: $0 'https://xxxx.cfc-execute.bj.baidubce.com'"
  echo "也可: export VITE_CFC_BASE='...' && $0 \"\$VITE_CFC_BASE\""
  exit 1
fi

URL="${URL%/}"

if ! command -v gh >/dev/null 2>&1; then
  echo "未找到 gh。安装: brew install gh && gh auth login"
  exit 1
fi

gh secret set VITE_CFC_BASE --repo "$REPO" --body "$URL"
echo "已设置 ${REPO} 的 Secret VITE_CFC_BASE=${URL}"
echo "请到 Actions 重新跑 Deploy VitePress，或空 commit / push 触发构建。"
