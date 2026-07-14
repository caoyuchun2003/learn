---
title: 问本站
description: 手册助教：检索摘要 + 可选千帆；优先 SSE，CFC 缓冲时假流式兜底。
---

# 问本站

> 手册助教：先检索课摘要，再（可选）经百度 CFC 调千帆回答。  
> **流式**：优先 `/api/ask/stream`；若 CFC 整包缓冲，则前端假流式打字机。

<script setup>
import { ref, computed, nextTick } from 'vue'
import { withBase } from 'vitepress'
import manifest from '../functions/data/manifest.json'
import { retrieve, buildLocalAnswer } from '../functions/src/retrieve.cjs'
import { askWithStreamFallback, typewriter } from './askStreamClient.js'

const scope = ref('all')
const input = ref('')
const loading = ref(false)
const error = ref('')
const messages = ref([])
const streamMode = ref('')
const mode = ref('')
const model = ref('')
const requestId = ref('')

const apiBase = (import.meta.env.VITE_CFC_BASE || '').replace(/\/$/, '')

const suggestions = computed(() => {
  const map = {
    all: [
      '教材阅读器要不要上 Agent？',
      'RAG 和微调怎么选？',
      '用公司类比怎么理解操作系统？',
    ],
    'agent-book': [
      '教材阅读器要不要上 Agent？',
      'Workflow 和 Agent 怎么选？',
      '什么时候才需要工具调用？',
    ],
    'ai-handbook': [
      'RAG 是什么？',
      'RAG 和微调怎么选？',
      'Workflow 和 Agent 有什么区别？',
    ],
    'os-book': [
      '用公司类比怎么理解操作系统？',
      '进程和线程有什么区别？',
      'Mac 为什么会卡、和 swap 有什么关系？',
    ],
    tools: ['方案决策器解决什么问题？', '问本站怎么用？'],
  }
  return map[scope.value] || map.all
})

const modeHint = computed(() => {
  if (streamMode.value === 'sse') return '真流式 SSE（CFC → 千帆）'
  if (streamMode.value === 'fake') return '假流式兜底（CFC 缓冲或 JSON 整包后打字机）'
  if (mode.value === 'local-retrieve') return '本地检索（未调用大模型）'
  if (apiBase) return `API：${apiBase}（优先 SSE）`
  return '未配置 VITE_CFC_BASE，仅本地检索 + 假流式'
})

function linkHref(link) {
  const p = link.path.replace(/\.html$/, '').replace(/^\/learn/, '')
  return withBase(p.startsWith('/') ? p : `/${p}`)
}

function historyForApi() {
  // 不含正在流式的空助手气泡；取已完成的对话
  return messages.value
    .filter((m) => m.role === 'user' || (m.role === 'assistant' && m.done))
    .slice(-8)
    .map((m) => ({ role: m.role, content: m.content }))
}

function clearChat() {
  messages.value = []
  error.value = ''
  streamMode.value = ''
  mode.value = ''
  model.value = ''
  requestId.value = ''
}

async function ask(text) {
  const q = String(text || '').trim()
  if (!q || loading.value) return
  if (q.length > 200) {
    error.value = '问题最多 200 字'
    return
  }

  error.value = ''
  loading.value = true
  input.value = ''

  messages.value.push({ role: 'user', content: q, done: true })
  const assistant = {
    role: 'assistant',
    content: '',
    refs: [],
    done: false,
  }
  messages.value.push(assistant)
  await nextTick()

  const hist = historyForApi().slice(0, -1) // 不含本轮 user？应含本轮前的历史
  // historyForApi 已含本轮 user；API 要的是本轮之前 → 去掉最后一条 user
  const history = hist.slice(0, -1)

  try {
    if (apiBase) {
      try {
        await askWithStreamFallback({
          apiBase,
          question: q,
          scope: scope.value,
          history,
          onMeta(ev) {
            if (ev.refs) assistant.refs = ev.refs
            if (ev.requestId) requestId.value = ev.requestId
          },
          onReplayStart() {
            assistant.content = ''
          },
          onDelta(t) {
            assistant.content += t
          },
          onDone(ev) {
            assistant.content = ev.answer || assistant.content
            assistant.refs = ev.refs || assistant.refs
            assistant.done = true
            streamMode.value = ev.streamMode || ''
            mode.value = ev.mode || ''
            model.value = ev.model || ''
            requestId.value = ev.requestId || requestId.value
          },
        })
        return
      } catch (e) {
        if (e.message !== 'NO_API') {
          // fall through local if CFC totally failed after onError
        }
      }
    }

    // 本地降级
    const refs = retrieve(manifest.entries, q, scope.value, 5)
    const local = buildLocalAnswer(q, refs)
    assistant.refs = local.refs || refs
    assistant.content = ''
    await typewriter(local.answer || '', (t) => {
      assistant.content += t
    })
    assistant.done = true
    mode.value = 'local-retrieve'
    streamMode.value = 'fake'
    requestId.value = 'local'
  } catch (e) {
    error.value = e.message || String(e)
    assistant.content = assistant.content || '请求失败，请稍后重试。'
    assistant.done = true
  } finally {
    loading.value = false
  }
}

function submit() {
  ask(input.value)
}

function useSuggestion(s) {
  ask(s)
}
</script>

<p class="hint">{{ modeHint }}</p>

<div class="chat">
  <div class="toolbar">
    <label>
      <span>范围</span>
      <select v-model="scope" :disabled="loading">
        <option value="all">全部手册</option>
        <option value="ai-handbook">AI 应用开发手册</option>
        <option value="agent-book">Agent 工程手册</option>
        <option value="os-book">操作系统白话</option>
        <option value="tools">站内工具</option>
      </select>
    </label>
    <button class="ghost" type="button" :disabled="loading || !messages.length" @click="clearChat">
      清空会话
    </button>
  </div>

  <div v-if="!messages.length" class="suggest">
    <p class="suggest-label">试试问：</p>
    <button
      v-for="(s, i) in suggestions"
      :key="i"
      type="button"
      class="chip"
      @click="useSuggestion(s)"
    >
      {{ s }}
    </button>
  </div>

  <div class="thread" aria-live="polite">
    <div
      v-for="(m, i) in messages"
      :key="i"
      class="bubble"
      :class="m.role"
    >
      <div class="role">{{ m.role === 'user' ? '你' : '助教' }}</div>
      <pre class="text">{{ m.content || (m.role === 'assistant' && loading ? '…' : '') }}</pre>
      <ul v-if="m.refs?.length" class="refs">
        <li v-for="(link, j) in m.refs" :key="j">
          <a :href="linkHref(link)">{{ link.title }}</a>
        </li>
      </ul>
    </div>
  </div>

  <div class="composer">
    <textarea
      v-model="input"
      rows="2"
      maxlength="200"
      :disabled="loading"
      placeholder="例如：教材阅读器要不要上 Agent？"
      @keydown.enter.exact.prevent="submit"
    />
    <button class="btn" type="button" :disabled="loading || !input.trim()" @click="submit">
      {{ loading ? '生成中…' : '发送' }}
    </button>
  </div>

  <p v-if="error" class="err">{{ error }}</p>
  <p v-if="requestId || mode" class="meta">
    <span v-if="requestId">requestId: {{ requestId }}</span>
    <span v-if="mode"> · mode: {{ mode }}</span>
    <span v-if="model"> · model: {{ model }}</span>
    <span v-if="streamMode"> · stream: {{ streamMode }}</span>
  </p>
</div>

## 相关

- [AI 方案决策器](/tools/ai-decision)
- [Learn × 百度 CFC 方案](/docs/learn-cfc-方案)

<style scoped>
.hint { color: var(--vp-c-text-2); font-size: 0.9rem; }
.chat {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  margin: 1rem 0 1.5rem;
  padding: 1rem 1.1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
}
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: end;
  justify-content: space-between;
}
.toolbar label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.9rem;
}
.toolbar select {
  padding: 0.35rem 0.5rem;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}
.ghost {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
  border-radius: 6px;
  padding: 0.35rem 0.7rem;
  cursor: pointer;
}
.ghost:disabled { opacity: 0.5; cursor: not-allowed; }
.suggest-label { margin: 0 0 0.4rem; color: var(--vp-c-text-2); font-size: 0.9rem; }
.chip {
  display: inline-block;
  margin: 0 0.4rem 0.4rem 0;
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
  font-size: 0.85rem;
}
.thread { display: flex; flex-direction: column; gap: 0.75rem; min-height: 4rem; }
.bubble {
  max-width: 92%;
  padding: 0.65rem 0.85rem;
  border-radius: 10px;
}
.bubble.user {
  align-self: flex-end;
  background: var(--vp-c-brand-soft);
}
.bubble.assistant {
  align-self: flex-start;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
}
.role { font-size: 0.75rem; color: var(--vp-c-text-3); margin-bottom: 0.25rem; }
.text {
  margin: 0;
  white-space: pre-wrap;
  font-family: inherit;
  line-height: 1.55;
}
.refs { margin: 0.5rem 0 0; padding-left: 1.1rem; font-size: 0.85rem; }
.composer { display: flex; gap: 0.6rem; align-items: flex-end; }
.composer textarea {
  flex: 1;
  padding: 0.5rem 0.65rem;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font: inherit;
  resize: vertical;
}
.btn {
  padding: 0.55rem 1rem;
  border-radius: 6px;
  border: none;
  background: var(--vp-c-brand-1);
  color: #fff;
  cursor: pointer;
  font-weight: 600;
  white-space: nowrap;
}
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.err { color: var(--vp-c-danger-1); margin: 0; }
.meta { font-size: 0.8rem; color: var(--vp-c-text-3); margin: 0; }
</style>
