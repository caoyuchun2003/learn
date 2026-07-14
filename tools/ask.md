---
title: 问本站
description: 根据 learn 手册摘要检索相关课；配置千帆后由百度 CFC 生成简短回答。
---

# 问本站

> 先检索手册摘要，再（可选）经百度 CFC 调千帆生成回答。  
> **未配置云函数 / 千帆时：只返回相关课程列表（本地检索）。**

<script setup>
import { ref, computed } from 'vue'
import { withBase } from 'vitepress'
import manifest from '../functions/data/manifest.json'
import { retrieve, buildLocalAnswer } from '../functions/src/retrieve.cjs'

const question = ref('')
const scope = ref('all')
const loading = ref(false)
const error = ref('')
const result = ref(null)
const mode = ref('')

const apiBase = (import.meta.env.VITE_CFC_BASE || '').replace(/\/$/, '')

const modeHint = computed(() => {
  if (mode.value === 'qianfan') return '生成回答来自百度 CFC + 千帆'
  if (mode.value === 'local-retrieve' || mode.value === 'local')
    return '本地检索（未调用大模型）。部署 CFC 并配置 QIANFAN_AK 后可启用生成回答。'
  if (mode.value === 'cfc-retrieve') return 'CFC 返回了检索/降级结果（可能未配置千帆 Key）'
  return apiBase
    ? `已配置 API：${apiBase}`
    : '未配置 VITE_CFC_BASE，仅本地检索'
})

function linkHref(link) {
  const p = link.path.replace(/\.html$/, '').replace(/^\/learn/, '')
  return withBase(p.startsWith('/') ? p : `/${p}`)
}

async function submit() {
  error.value = ''
  result.value = null
  const q = question.value.trim()
  if (!q) {
    error.value = '请先输入问题'
    return
  }
  if (q.length > 200) {
    error.value = '问题最多 200 字'
    return
  }

  loading.value = true
  const payload = { question: q, scope: scope.value, client: 'learn-web' }

  try {
    if (apiBase) {
      try {
        const res = await fetch(`${apiBase}/api/ask`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.message || data.code || `HTTP ${res.status}`)
        }
        result.value = data
        mode.value = data.mode === 'qianfan' ? 'qianfan' : 'cfc-retrieve'
        return
      } catch (e) {
        console.warn('CFC ask failed, fallback local', e)
      }
    }

    const refs = retrieve(manifest.entries, q, scope.value, 5)
    const local = buildLocalAnswer(q, refs)
    result.value = { ...local, requestId: 'local' }
    mode.value = 'local-retrieve'
  } catch (e) {
    error.value = e.message || String(e)
  } finally {
    loading.value = false
  }
}
</script>

<p class="hint">{{ modeHint }}</p>

<div class="panel">
  <label class="q">
    <span>范围</span>
    <select v-model="scope">
      <option value="all">全部手册</option>
      <option value="ai-handbook">AI 应用开发手册</option>
      <option value="agent-book">Agent 工程手册</option>
      <option value="os-book">操作系统白话</option>
      <option value="tools">站内工具</option>
    </select>
  </label>

  <label class="q">
    <span>你的问题</span>
    <textarea v-model="question" rows="3" maxlength="200" placeholder="例如：教材阅读器要不要上 Agent？RAG 和微调怎么选？" />
  </label>

  <button class="btn" type="button" :disabled="loading" @click="submit">
    {{ loading ? '检索中…' : '提问' }}
  </button>
</div>

<p v-if="error" class="err">{{ error }}</p>

<div v-if="result" class="result">
  <h2>回答</h2>
  <pre class="answer">{{ result.answer }}</pre>
  <h3 v-if="result.refs?.length">相关阅读</h3>
  <ul v-if="result.refs?.length">
    <li v-for="(link, i) in result.refs" :key="i">
      <a :href="linkHref(link)">{{ link.title }}</a>
      <span v-if="link.snippet" class="snip"> — {{ link.snippet }}</span>
    </li>
  </ul>
  <p class="meta">
    requestId: {{ result.requestId }} · mode: {{ result.mode || mode }}
    <span v-if="result.model"> · model: {{ result.model }}</span>
  </p>
</div>

## 相关

- [AI 方案决策器](/tools/ai-decision)（非 AI 规则）
- [Learn × 百度 CFC 方案](/docs/learn-cfc-方案)
- [functions 部署说明](https://github.com/caoyuchun2003/learn/blob/main/functions/README.md)

<style scoped>
.hint { color: var(--vp-c-text-2); font-size: 0.9rem; }
.panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  margin: 1rem 0 1.5rem;
}
.q { display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.95rem; }
.q select, .q textarea {
  padding: 0.45rem 0.6rem;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font: inherit;
}
.btn {
  align-self: flex-start;
  padding: 0.55rem 1.1rem;
  border-radius: 6px;
  border: none;
  background: var(--vp-c-brand-1);
  color: #fff;
  cursor: pointer;
  font-weight: 600;
}
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.err { color: var(--vp-c-danger-1); }
.result {
  padding: 1rem 1.25rem;
  border-left: 3px solid var(--vp-c-brand-1);
  background: var(--vp-c-bg-soft);
  border-radius: 0 8px 8px 0;
}
.answer {
  white-space: pre-wrap;
  font-family: inherit;
  margin: 0;
  line-height: 1.6;
}
.snip { color: var(--vp-c-text-2); font-size: 0.85rem; }
.meta { font-size: 0.8rem; color: var(--vp-c-text-3); }
</style>
