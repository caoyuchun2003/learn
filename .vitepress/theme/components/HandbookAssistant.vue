<script setup>
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import { withBase } from 'vitepress'
import manifest from '../../../functions/data/manifest.json'
import { retrieve, buildLocalAnswer } from '../../../functions/src/retrieve.cjs'
import {
  askWithStreamFallback,
  typewriter,
} from '../../../tools/askStreamClient.js'
import {
  scopeFromPath,
  SCOPE_OPTIONS,
  SUGGESTIONS,
} from '../scopeFromPath.js'

const props = defineProps({
  /** page | drawer */
  variant: { type: String, default: 'page' },
  /** 外部传入的初始 scope；空则可由 autoScope 推断 */
  initialScope: { type: String, default: '' },
  autoScope: { type: Boolean, default: true },
})

const scope = ref(props.initialScope || 'all')
const input = ref('')
const loading = ref(false)
const error = ref('')
const messages = ref([])
const streamMode = ref('')
const mode = ref('')
const model = ref('')
const requestId = ref('')
const feedback = ref({}) // id -> up|down

const apiBase = (import.meta.env.VITE_CFC_BASE || '').replace(/\/$/, '')

const suggestions = computed(
  () => SUGGESTIONS[scope.value] || SUGGESTIONS.all,
)

const modeHint = computed(() => {
  if (streamMode.value === 'sse') return '真流式 SSE（CFC → 千帆）'
  if (streamMode.value === 'fake')
    return '假流式兜底（CFC 缓冲或 JSON 整包后打字机）'
  if (mode.value === 'local-retrieve') return '本地检索（未调用大模型）'
  if (apiBase) return '优先 SSE；失败则假流式 / 本地检索'
  return '未配置云函数，仅本地检索 + 假流式'
})

function syncScopeFromUrl() {
  if (!props.autoScope) return
  if (typeof window === 'undefined') return
  scope.value = scopeFromPath(window.location.pathname)
}

onMounted(() => {
  if (props.initialScope) scope.value = props.initialScope
  else syncScopeFromUrl()
})

watch(
  () => props.initialScope,
  (v) => {
    if (v) scope.value = v
  },
)

function linkHref(link) {
  const p = link.path.replace(/\.html$/, '').replace(/^\/learn/, '')
  return withBase(p.startsWith('/') ? p : `/${p}`)
}

function historyForApi() {
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
  feedback.value = {}
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
    id: 'a_' + Date.now().toString(36),
    role: 'assistant',
    content: '',
    refs: [],
    done: false,
  }
  messages.value.push(assistant)
  await nextTick()

  const hist = historyForApi()
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
      } catch {
        // fall through
      }
    }

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

function setFeedback(id, value) {
  feedback.value = { ...feedback.value, [id]: value }
}

defineExpose({ clearChat, syncScopeFromUrl, ask })
</script>

<template>
  <div class="ha" :class="variant">
    <p class="hint">{{ modeHint }}</p>

    <div class="toolbar">
      <label>
        <span>范围</span>
        <select v-model="scope" :disabled="loading">
          <option v-for="o in SCOPE_OPTIONS" :key="o.value" :value="o.value">
            {{ o.label }}
          </option>
        </select>
      </label>
      <button
        class="ghost"
        type="button"
        :disabled="loading || !messages.length"
        @click="clearChat"
      >
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
        <div class="role">{{ m.role === 'user' ? '你' : '手册助教' }}</div>
        <pre class="text">{{
          m.content || (m.role === 'assistant' && loading ? '…' : '')
        }}</pre>
        <ul v-if="m.refs?.length" class="refs">
          <li v-for="(link, j) in m.refs" :key="j">
            <a :href="linkHref(link)">{{ link.title }}</a>
          </li>
        </ul>
        <div v-if="m.role === 'assistant' && m.done && m.id" class="fb">
          <button
            type="button"
            class="fb-btn"
            :class="{ on: feedback[m.id] === 'up' }"
            title="有帮助"
            @click="setFeedback(m.id, 'up')"
          >
            有用
          </button>
          <button
            type="button"
            class="fb-btn"
            :class="{ on: feedback[m.id] === 'down' }"
            title="没帮助"
            @click="setFeedback(m.id, 'down')"
          >
            不准
          </button>
        </div>
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
      <button
        class="btn"
        type="button"
        :disabled="loading || !input.trim()"
        @click="submit"
      >
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
</template>

<style scoped>
.ha {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}
.ha.page {
  margin: 1rem 0 1.5rem;
  padding: 1rem 1.1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
}
.ha.drawer {
  height: 100%;
  min-height: 0;
}
.hint {
  color: var(--vp-c-text-2);
  font-size: 0.85rem;
  margin: 0;
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
.ghost:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.suggest-label {
  margin: 0 0 0.4rem;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}
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
.thread {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 3rem;
  flex: 1;
  overflow: auto;
}
.bubble {
  max-width: 96%;
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
.role {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin-bottom: 0.25rem;
}
.text {
  margin: 0;
  white-space: pre-wrap;
  font-family: inherit;
  line-height: 1.55;
}
.refs {
  margin: 0.5rem 0 0;
  padding-left: 1.1rem;
  font-size: 0.85rem;
}
.fb {
  margin-top: 0.45rem;
  display: flex;
  gap: 0.4rem;
}
.fb-btn {
  font-size: 0.75rem;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-3);
  cursor: pointer;
}
.fb-btn.on {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
.composer {
  display: flex;
  gap: 0.6rem;
  align-items: flex-end;
}
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
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.err {
  color: var(--vp-c-danger-1);
  margin: 0;
  font-size: 0.9rem;
}
.meta {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0;
}
</style>
