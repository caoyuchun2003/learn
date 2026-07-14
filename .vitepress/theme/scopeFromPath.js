/** 根据站内路径推断问本站 scope */

export function scopeFromPath(pathname) {
  let p = String(pathname || '')
  try {
    p = decodeURIComponent(p)
  } catch {
    /* keep raw */
  }
  if (p.includes('/agent-book')) return 'agent-book'
  if (p.includes('AI应用开发手册') || p.includes('/AI应用开发'))
    return 'ai-handbook'
  if (p.includes('/os-book')) return 'os-book'
  if (p.includes('/model-cost-book')) return 'model-cost-book'
  if (p.includes('/claude-code-book')) return 'claude-code-book'
  if (p.includes('/tools')) return 'tools'
  return 'all'
}

export const SCOPE_OPTIONS = [
  { value: 'all', label: '全部手册' },
  { value: 'ai-handbook', label: 'AI 应用开发手册' },
  { value: 'agent-book', label: 'Agent 工程手册' },
  { value: 'os-book', label: '操作系统白话' },
  { value: 'model-cost-book', label: '模型与成本落地' },
  { value: 'claude-code-book', label: 'Claude Code' },
  { value: 'tools', label: '站内工具' },
]

export const SUGGESTIONS = {
  all: [
    '教材阅读器要不要上 Agent？',
    'RAG 和微调怎么选？',
    'DeepSeek 和文心怎么选？',
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
  'model-cost-book': [
    '模型是不是越贵越好？',
    'DeepSeek 和文心怎么选？',
    '为什么 CFC 常常是假流式？',
  ],
  'claude-code-book': [
    'Claude Code 和 Cursor 有什么区别？',
    '什么是 Skills 和 Hooks？',
    'MCP 用在什么场景？',
  ],
  tools: ['方案决策器解决什么问题？', '问本站怎么用？'],
}
