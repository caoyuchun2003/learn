const fs = require('fs')
const path = require('path')
const { retrieve, buildLocalAnswer } = require('../src/retrieve.cjs')

const manifest = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/manifest.json'), 'utf8'),
)

const refs = retrieve(manifest.entries, '教材阅读器要不要上 Agent', 'agent-book', 3)
console.log(
  refs.length ? '✓' : '✗',
  '检索条数',
  refs.length,
  refs.map((r) => r.id).join(', '),
)

const local = buildLocalAnswer('RAG 是什么', retrieve(manifest.entries, 'RAG 是什么', 'all', 3))
console.log(local.refs.length ? '✓' : '✗', 'local answer refs', local.refs.length)

process.exit(refs.length && local.refs.length ? 0 : 1)
