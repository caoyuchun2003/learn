import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { h } from 'vue'
import AskShell from './components/AskShell.vue'
import HandbookAssistant from './components/HandbookAssistant.vue'
import './custom.css'

const theme: Theme = {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'layout-bottom': () => h(AskShell),
    })
  },
  enhanceApp({ app }) {
    app.component('HandbookAssistant', HandbookAssistant)
  },
}

export default theme
