/**
 * CJS 入口（CFC CommonJS require）
 * 逻辑与 decideEngine.js 保持同步。
 */

const LINKS = {
  agent01: {
    title: 'Agent 工程 · 第 01 课 · 教材阅读器要不要上 Agent？',
    path: '/learn/agent-book/01-第01课-教材阅读器要不要上Agent.html',
  },
  agent03: {
    title: 'Agent 工程 · 第 03 课 · RAG 够了吗？什么时候才需要工具',
    path: '/learn/agent-book/03-第03课-RAG够了吗什么时候才需要工具.html',
  },
  agent06: {
    title: 'Agent 工程 · 第 06 课 · 自主 Agent',
    path: '/learn/agent-book/06-第06课-自主Agent.html',
  },
  agent07: {
    title: 'Agent 工程 · 第 07 课 · 工具设计与安全',
    path: '/learn/agent-book/07-第07课-工具设计与安全.html',
  },
  ai03: {
    title: 'AI 应用开发 · 第 3 课 · RAG',
    path: '/learn/AI应用开发手册/03-RAG检索增强.html',
  },
  ai04: {
    title: 'AI 应用开发 · 第 4 课 · Agent',
    path: '/learn/AI应用开发手册/04-Agent智能体.html',
  },
  ai16: {
    title: 'AI 应用开发 · 第 16 课 · 设计模式（Workflow vs Agent）',
    path: '/learn/AI应用开发手册/16-AI系统设计模式.html',
  },
  guide: {
    title: 'Agent 工程 · 前言与导读',
    path: '/learn/agent-book/00-前言与导读.html',
  },
}

function yn(v) {
  if (v === true || v === 'yes' || v === 'y' || v === 1 || v === '1') return 'yes'
  if (v === false || v === 'no' || v === 'n' || v === 0 || v === '0') return 'no'
  return null
}

function decide(input = {}) {
  const stepsFixed = yn(input.stepsFixed)
  const textOnly = yn(input.textOnly)
  const knowledgeInDocs = yn(input.knowledgeInDocs)
  const needHumanInLoop = yn(input.needHumanInLoop)

  const missing = ['stepsFixed', 'textOnly', 'knowledgeInDocs', 'needHumanInLoop'].filter(
    (k) => yn(input[k]) == null,
  )
  if (missing.length) {
    return {
      ok: false,
      error: `缺少或无效字段: ${missing.join(', ')}（请使用 yes/no）`,
    }
  }

  let recommend
  let avoid
  let reasons
  let linkKeys

  if (stepsFixed === 'yes' && textOnly === 'yes' && knowledgeInDocs === 'yes') {
    recommend = 'Workflow + RAG'
    avoid = '自主 Agent'
    reasons = ['步骤可预先写死', '只要文本问答', '知识在文档/教材库内']
    linkKeys = ['agent01', 'ai03', 'ai16']
  } else if (stepsFixed === 'yes' && textOnly === 'no') {
    recommend = 'Workflow + 单次 Function Calling'
    avoid = '一上来上自主 Agent 循环'
    reasons = ['步骤仍可固化成流水线', '需要调外部 API/工具，用单次或固定步调用即可']
    linkKeys = ['agent03', 'agent07', 'ai16']
  } else if (stepsFixed === 'no' && textOnly === 'no') {
    recommend = '自主 Agent + 沙箱 / 人在环审批'
    avoid = '无审批的开放工具调用'
    reasons = ['步骤无法预定义，需要探索式规划', '要动手调工具，安全约束必须跟上']
    linkKeys = ['agent06', 'ai04', 'ai16']
  } else if (stepsFixed === 'no' && textOnly === 'yes') {
    recommend = '先做路由 + RAG / 提示链，暂缓 Agent'
    avoid = '为了「智能」硬上 ReAct'
    reasons = ['虽路径不定，但仍以问答为主', '多数可用检索 + 分流覆盖']
    linkKeys = ['agent01', 'agent03', 'ai03']
  } else {
    recommend = '先补齐知识来源或 Prompt，再谈架构升级'
    avoid = '用 Agent「幻觉式」补知识'
    reasons = ['文档库未就绪时，优先 Prompt / 临时上下文，而不是复杂智能体']
    linkKeys = ['ai03', 'guide', 'ai16']
  }

  if (needHumanInLoop === 'yes' && recommend.includes('自主 Agent')) {
    reasons = reasons.concat(['你选择了人在环：务必保留审批与可撤销'])
  }
  if (needHumanInLoop === 'yes' && !recommend.includes('自主 Agent')) {
    reasons = reasons.concat(['人在环：在 Workflow 固定节点插入确认即可'])
  }

  return {
    ok: true,
    result: {
      recommend,
      avoid,
      reasons,
      links: linkKeys.map((k) => LINKS[k]),
      answers: { stepsFixed, textOnly, knowledgeInDocs, needHumanInLoop },
    },
  }
}

module.exports = { decide }
