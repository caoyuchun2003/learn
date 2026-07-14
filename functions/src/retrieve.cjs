/**
 * 基于 manifest 的轻量关键词检索（非向量）
 */

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[\s，。！？、；：""''（）()【】\[\]·\/\\]+/g, ' ')
    .trim()
}

function scoreEntry(entry, question, scope) {
  if (scope && scope !== 'all' && entry.scope !== scope) return -1

  const q = normalize(question)
  if (!q) return -1

  const tokens = q.split(' ').filter((t) => t.length >= 1)
  let score = 0
  const title = normalize(entry.title)
  const snippet = normalize(entry.snippet)
  const keywords = (entry.keywords || []).map(normalize)

  for (const t of tokens) {
    if (t.length < 2 && !/^[a-z]+$/.test(t)) continue
    if (title.includes(t)) score += 5
    if (keywords.some((k) => k.includes(t) || t.includes(k))) score += 4
    if (snippet.includes(t)) score += 2
  }

  // phrase boost
  for (const k of keywords) {
    if (k.length >= 2 && q.includes(k)) score += 3
  }

  return score
}

/**
 * @param {object[]} entries
 * @param {string} question
 * @param {string} scope
 * @param {number} topK
 */
function retrieve(entries, question, scope = 'all', topK = 5) {
  const ranked = entries
    .map((e) => ({ entry: e, score: scoreEntry(e, question, scope) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)

  return ranked.map((x) => ({
    id: x.entry.id,
    title: x.entry.title,
    path: x.entry.path,
    snippet: x.entry.snippet,
    score: x.score,
  }))
}

/**
 * 无模型时的降级回答：只返回相关课 + 固定导语
 */
function buildLocalAnswer(question, refs) {
  if (!refs.length) {
    return {
      answer:
        '在当前手册摘要里没有检索到足够相关的课。建议打开书库目录，或换个关键词（如 RAG、Agent、Workflow、内存）。',
      refs: [],
      mode: 'local-retrieve',
    }
  }
  const lines = refs.map((r, i) => `${i + 1}. ${r.title}`).join('\n')
  return {
    answer: `（本地检索，未调用大模型）与「${question.slice(0, 40)}」较相关的手册章节：\n${lines}\n\n请点下方链接阅读原文；部署百度 CFC 并配置 QIANFAN_AK 后可启用生成式「问本站」。`,
    refs,
    mode: 'local-retrieve',
  }
}

module.exports = { retrieve, buildLocalAnswer, normalize }
