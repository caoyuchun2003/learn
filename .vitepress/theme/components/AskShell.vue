<script setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, withBase } from 'vitepress'
import HandbookAssistant from './HandbookAssistant.vue'
import { scopeFromPath } from '../scopeFromPath.js'

const fullAskHref = withBase('/tools/ask')

const route = useRoute()
const open = ref(false)
const panelScope = ref('all')
const assistantRef = ref(null)

const hideOnAskPage = () => {
  const path = route.path || ''
  return path.includes('/tools/ask')
}

function openDrawer() {
  panelScope.value = scopeFromPath(
    typeof window !== 'undefined' ? window.location.pathname : route.path,
  )
  open.value = true
  nextTick(() => {
    assistantRef.value?.syncScopeFromUrl?.()
    assistantRef.value?.focusInput?.()
  })
}

function closeDrawer() {
  open.value = false
}

function onKeydown(e) {
  if (e.key === 'Escape' && open.value) {
    e.preventDefault()
    closeDrawer()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})

watch(
  () => route.path,
  () => {
    if (open.value) {
      panelScope.value = scopeFromPath(
        typeof window !== 'undefined' ? window.location.pathname : route.path,
      )
    }
  },
)
</script>

<template>
  <Teleport to="body">
    <button
      v-if="!hideOnAskPage()"
      type="button"
      class="ask-fab"
      aria-label="打开手册助教"
      @click="openDrawer"
    >
      问手册
    </button>

    <div
      v-if="open"
      class="ask-mask"
      @click.self="closeDrawer"
    >
      <aside class="ask-drawer" role="dialog" aria-modal="true" aria-label="手册助教">
        <header class="ask-head">
          <div>
            <strong>手册助教</strong>
            <span class="sub">只据本站课摘要回答 · Esc 关闭</span>
          </div>
          <button type="button" class="ask-x" aria-label="关闭" @click="closeDrawer">
            ×
          </button>
        </header>
        <div class="ask-body">
          <HandbookAssistant
            ref="assistantRef"
            variant="drawer"
            :initial-scope="panelScope"
            :auto-scope="true"
          />
        </div>
        <footer class="ask-foot">
          <a :href="fullAskHref">打开完整页</a>
        </footer>
      </aside>
    </div>
  </Teleport>
</template>

<style scoped>
.ask-fab {
  position: fixed;
  right: 1.25rem;
  bottom: 1.5rem;
  z-index: 40;
  padding: 0.65rem 1rem;
  border: none;
  border-radius: 999px;
  background: var(--vp-c-brand-1);
  color: #fff;
  font-weight: 650;
  font-size: 0.9rem;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
}
.ask-fab:hover {
  filter: brightness(1.05);
}
.ask-mask {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  justify-content: flex-end;
}
.ask-drawer {
  width: min(420px, 100vw);
  height: 100%;
  background: var(--vp-c-bg);
  border-left: 1px solid var(--vp-c-divider);
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 24px rgba(0, 0, 0, 0.12);
}
.ask-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem 1rem 0.75rem;
  border-bottom: 1px solid var(--vp-c-divider);
  flex-shrink: 0;
}
.ask-head .sub {
  display: block;
  margin-top: 0.2rem;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  font-weight: 400;
}
.ask-x {
  border: none;
  background: transparent;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  color: var(--vp-c-text-2);
  padding: 0 0.25rem;
}
.ask-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 0.75rem 1rem 0.5rem;
  display: flex;
  flex-direction: column;
}
.ask-foot {
  padding: 0.65rem 1rem;
  border-top: 1px solid var(--vp-c-divider);
  font-size: 0.85rem;
  flex-shrink: 0;
}
.ask-foot a {
  color: var(--vp-c-brand-1);
}
@media (max-width: 640px) {
  .ask-fab {
    right: 0.85rem;
    bottom: 1rem;
  }
  .ask-drawer {
    width: 100vw;
  }
}
</style>
