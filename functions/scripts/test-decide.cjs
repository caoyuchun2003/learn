const { decide } = require('../src/decideEngine.cjs')

const cases = [
  {
    name: '教材问答 → Workflow+RAG',
    input: {
      stepsFixed: 'yes',
      textOnly: 'yes',
      knowledgeInDocs: 'yes',
      needHumanInLoop: 'yes',
    },
    expect: 'Workflow + RAG',
  },
  {
    name: '要调 API → Function Calling',
    input: {
      stepsFixed: 'yes',
      textOnly: 'no',
      knowledgeInDocs: 'yes',
      needHumanInLoop: 'yes',
    },
    expect: 'Workflow + 单次 Function Calling',
  },
  {
    name: '开放任务 → Agent',
    input: {
      stepsFixed: 'no',
      textOnly: 'no',
      knowledgeInDocs: 'yes',
      needHumanInLoop: 'yes',
    },
    expect: '自主 Agent + 沙箱 / 人在环审批',
  },
]

let failed = 0
for (const c of cases) {
  const out = decide(c.input)
  const ok = out.ok && out.result.recommend === c.expect
  console.log(ok ? '✓' : '✗', c.name, '→', out.ok ? out.result.recommend : out.error)
  if (!ok) failed += 1
}

const bad = decide({ stepsFixed: 'yes' })
if (bad.ok) {
  console.log('✗ 应拒绝不完整输入')
  failed += 1
} else {
  console.log('✓ 不完整输入被拒绝')
}

process.exit(failed ? 1 : 0)
