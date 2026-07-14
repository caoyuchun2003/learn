---
title: AI 方案决策器
description: 四个问题，判断 Workflow / RAG / Agent——规则引擎，不调用大模型。
---

# AI 方案决策器

> 四个问题，给出架构建议，并链到站内课文。  
> **不调用大模型**（规则引擎）。有百度 CFC 时走云函数；否则浏览器本地计算。

<script setup>
import { ref, computed } from 'vue'
import { withBase } from 'vitepress'
import { decide } from '../functions/src/decideEngine.cjs'

const stepsFixed = ref('yes')
const textOnly = ref('yes')
const knowledgeInDocs = ref('yes')
const needHumanInLoop = ref('yes')

const loading = ref(false)
const error = ref('')
const result = ref(null)
const mode = ref('')

const apiBase = (import.meta.env.VITE_CFC_BASE || '').replace(/\/$/, '')

const modeHint = computed(() => {
  if (mode.value === 'cfc') return '结果来自百度 CFC API'
  if (mode.value === 'local') return '结果来自浏览器本地规则（未配置 VITE_CFC_BASE 或接口不可用）'
  return apiBase
    ? `已配置 API：${apiBase}（提交时优先走云函数）`
    : '未配置 VITE_CFC_BASE，将使用本地规则'
})

function linkHref(link) {
  const p = link.path.replace(/\.html$/, '').replace(/^\/learn/, '')
  return withBase(p.startsWith('/') ? p : `/${p}`)
}

async function submit() {
  error.value = ''
  result.value = null
  loading.value = true
  const payload = {
    stepsFixed: stepsFixed.value,
    textOnly: textOnly.value,
    knowledgeInDocs: knowledgeInDocs.value,
    needHumanInLoop: needHumanInLoop.value,
    client: 'learn-web',
  }

  try {
    if (apiBase) {
      try {
        const res = await fetch(`${apiBase}/api/decide`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.message || data.code || `HTTP ${res.status}`)
        }
        result.value = data
        mode.value = 'cfc'
        return
      } catch (e) {
        // fall through to local
        console.warn('CFC decide failed, fallback local', e)
      }
    }

    const out = decide(payload)
    if (!out.ok) {
      error.value = out.error
      return
    }
    result.value = { ...out.result, requestId: 'local' }
    mode.value = 'local'
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
    <span>1. 步骤能否预先写死？</span>
    <select v-model="stepsFixed">
      <option value="yes">能（固定流水线）</option>
      <option value="no">不能（路径要探索）</option>
    </select>
  </label>

  <label class="q">
    <span>2. 是否只要文本问答？</span>
    <select v-model="textOnly">
      <option value="yes">是（生成文字即可）</option>
      <option value="no">否（要调 API / 改系统状态）</option>
    </select>
  </label>

  <label class="q">
    <span>3. 知识是否在文档 / 教材库？</span>
    <select v-model="knowledgeInDocs">
      <option value="yes">是</option>
      <option value="no">否 / 还不清楚</option>
    </select>
  </label>

  <label class="q">
    <span>4. 高风险是否需要人在环？</span>
    <select v-model="needHumanInLoop">
      <option value="yes">需要</option>
      <option value="no">暂不强调</option>
    </select>
  </label>

  <button class="btn" type="button" :disabled="loading" @click="submit">
    {{ loading ? '计算中…' : '给出建议' }}
  </button>
</div>

<p v-if="error" class="err">{{ error }}</p>

<div v-if="result" class="result">
  <h2>建议</h2>
  <p><strong>{{ result.recommend }}</strong></p>
  <p v-if="result.avoid">尽量先别：{{ result.avoid }}</p>
  <h3>理由</h3>
  <ul>
    <li v-for="(r, i) in result.reasons" :key="i">{{ r }}</li>
  </ul>
  <h3>站内阅读</h3>
  <ul>
    <li v-for="(link, i) in result.links" :key="i">
      <a :href="linkHref(link)">{{ link.title }}</a>
    </li>
  </ul>
  <p class="meta">requestId: {{ result.requestId }} · {{ mode === 'cfc' ? 'CFC' : 'local' }}</p>
</div>

## 相关文档

- [Learn × 百度 CFC 方案](/docs/learn-cfc-方案)
- [Agent 工程手册 · 第 01 课](/agent-book/01-第01课-教材阅读器要不要上Agent)
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
.q select {
  padding: 0.45rem 0.6rem;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
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
.meta { font-size: 0.8rem; color: var(--vp-c-text-3); }
</style>
