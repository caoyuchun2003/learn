/**
 * 千帆 Chat Completions（v2 Bearer）
 * 兼容 CFC nodejs12：https + 可选 SSE stream
 */

const https = require('https')
const { URL } = require('url')

function defaultSystemPrompt() {
  return [
    '你是「曹宇春 learn 手册」只读助教。',
    '主要依据用户消息里的手册摘录回答；可做导读级概括，并点名该读哪几课。',
    '摘录与问题明显无关时才说「手册未覆盖」，并给 1～2 个更具体的问法建议。',
    '禁止编造课名或不在摘录中的细节。',
    '用简洁中文，建议不超过 400 字。',
    '在 JSON 中返回：{"answer":"...","ref_ids":["id1","id2"]}',
    'ref_ids 必须来自摘录中的 id，按相关性选 1～5 个；没有就 []。',
    '只输出一个 JSON 对象，不要 Markdown 代码围栏。',
  ].join('\n')
}

function buildRefBlock(refs) {
  return (refs || [])
    .map(function (r, i) {
      return (
        '[' +
        (i + 1) +
        '] id=' +
        r.id +
        '\n标题: ' +
        r.title +
        '\n摘要: ' +
        r.snippet +
        '\n路径: ' +
        r.path
      )
    })
    .join('\n\n')
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) return []
  const out = []
  for (var i = 0; i < history.length; i++) {
    var h = history[i] || {}
    var role = h.role === 'assistant' ? 'assistant' : 'user'
    var content = String(h.content || '').trim()
    if (!content) continue
    out.push({ role: role, content: content.slice(0, 500) })
  }
  if (out.length > 8) return out.slice(out.length - 8)
  return out
}

function streamSystemPrompt() {
  return [
    '你是「曹宇春 learn 手册」只读助教。',
    '主要依据手册摘录做导读级回答，并点名该读哪几课。',
    '摘录与问题明显无关时说「手册未覆盖」，并给 1～2 个更具体的问法。',
    '禁止编造课名或不在摘录中的细节。',
    '直接输出简洁中文正文（不超过 400 字），不要 JSON、不要 Markdown 代码围栏。',
  ].join('\n')
}

function buildMessages({ system, user, refs, history, plain }) {
  const systemPrompt =
    system || (plain ? streamSystemPrompt() : defaultSystemPrompt())
  const refBlock = buildRefBlock(refs)
  const hist = normalizeHistory(history)
  const messages = [{ role: 'system', content: systemPrompt }]
  for (var i = 0; i < hist.length; i++) {
    messages.push(hist[i])
  }
  messages.push({
    role: 'user',
    content:
      '用户问题：' + user + '\n\n手册摘录：\n' + (refBlock || '（无）'),
  })
  return messages
}

function getAk() {
  return process.env.QIANFAN_AK || process.env.QIANFAN_API_KEY || ''
}

function getModel() {
  return process.env.QIANFAN_MODEL || 'ernie-x1.1'
}

function getApiUrl() {
  return (
    process.env.QIANFAN_API_URL ||
    'https://qianfan.baidubce.com/v2/chat/completions'
  )
}

function httpJson(method, urlStr, headers, bodyObj) {
  return new Promise(function (resolve, reject) {
    const u = new URL(urlStr)
    const body = bodyObj != null ? JSON.stringify(bodyObj) : null
    const req = https.request(
      {
        protocol: u.protocol,
        hostname: u.hostname,
        port: u.port || 443,
        path: u.pathname + u.search,
        method: method,
        headers: Object.assign(
          {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          headers || {},
          body ? { 'Content-Length': Buffer.byteLength(body) } : {},
        ),
      },
      function (res) {
        const chunks = []
        res.on('data', function (c) {
          chunks.push(c)
        })
        res.on('end', function () {
          const text = Buffer.concat(chunks).toString('utf8')
          let data = {}
          try {
            data = text ? JSON.parse(text) : {}
          } catch (e) {
            data = { raw: text }
          }
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            status: res.statusCode,
            data: data,
          })
        })
      },
    )
    req.on('error', reject)
    if (body) req.write(body)
    req.end()
  })
}

function extractErrorMessage(data, status) {
  var msg = data.message || data.error_msg || data.error_description
  if (!msg && data.error) {
    msg =
      typeof data.error === 'string'
        ? data.error
        : data.error.message || JSON.stringify(data.error)
  }
  return msg || '千帆 HTTP ' + status
}

function extractContent(data) {
  if (
    data.choices &&
    data.choices[0] &&
    data.choices[0].message &&
    data.choices[0].message.content
  ) {
    return String(data.choices[0].message.content)
  }
  if (data.result) return String(data.result)
  if (data.answer) return String(data.answer)
  return ''
}

function extractDelta(data) {
  if (
    data.choices &&
    data.choices[0] &&
    data.choices[0].delta &&
    data.choices[0].delta.content
  ) {
    return String(data.choices[0].delta.content)
  }
  if (
    data.choices &&
    data.choices[0] &&
    data.choices[0].message &&
    data.choices[0].message.content
  ) {
    return String(data.choices[0].message.content)
  }
  return ''
}

async function chatWithQianfan({ system, user, refs, history }) {
  const ak = getAk()
  if (!ak) {
    const err = new Error('未配置 QIANFAN_AK')
    err.code = 'DISABLED'
    throw err
  }
  const model = getModel()
  const messages = buildMessages({
    system: system,
    user: user,
    refs: refs,
    history: history,
  })
  const res = await httpJson(
    'POST',
    getApiUrl(),
    { Authorization: 'Bearer ' + ak },
    { model: model, messages: messages, temperature: 0.2 },
  )
  const data = res.data || {}
  if (!res.ok) {
    const err = new Error(extractErrorMessage(data, res.status))
    err.code = 'UPSTREAM'
    err.detail = data
    throw err
  }
  return { content: extractContent(data), model: model, raw: data }
}

/**
 * 上游真 SSE；onDelta(textChunk) 可选。返回完整 content。
 */
function streamChatWithQianfan({ system, user, refs, history, onDelta }) {
  const ak = getAk()
  if (!ak) {
    const err = new Error('未配置 QIANFAN_AK')
    err.code = 'DISABLED'
    return Promise.reject(err)
  }
  const model = getModel()
  const messages = buildMessages({
    system: system,
    user: user,
    refs: refs,
    history: history,
    plain: true,
  })
  const urlStr = getApiUrl()
  const u = new URL(urlStr)
  const body = JSON.stringify({
    model: model,
    messages: messages,
    temperature: 0.2,
    stream: true,
  })

  return new Promise(function (resolve, reject) {
    const req = https.request(
      {
        protocol: u.protocol,
        hostname: u.hostname,
        port: u.port || 443,
        path: u.pathname + u.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
          Authorization: 'Bearer ' + ak,
          'Content-Length': Buffer.byteLength(body),
        },
      },
      function (res) {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          const chunks = []
          res.on('data', function (c) {
            chunks.push(c)
          })
          res.on('end', function () {
            let data = {}
            try {
              data = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
            } catch (e) {
              data = {}
            }
            const err = new Error(extractErrorMessage(data, res.statusCode))
            err.code = 'UPSTREAM'
            err.detail = data
            reject(err)
          })
          return
        }

        let buf = ''
        let content = ''
        res.setEncoding('utf8')
        res.on('data', function (chunk) {
          buf += chunk
          var parts = buf.split('\n')
          buf = parts.pop() || ''
          for (var i = 0; i < parts.length; i++) {
            var line = parts[i].replace(/\r$/, '')
            if (!line || line[0] === ':') continue
            if (line.indexOf('data:') !== 0) continue
            var payload = line.slice(5).trim()
            if (!payload || payload === '[DONE]') continue
            try {
              var obj = JSON.parse(payload)
              var delta = extractDelta(obj)
              if (delta) {
                content += delta
                if (typeof onDelta === 'function') onDelta(delta)
              }
            } catch (e) {
              // ignore
            }
          }
        })
        res.on('end', function () {
          resolve({ content: content, model: model })
        })
      },
    )
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

function parseModelJson(content) {
  const text = String(content || '').trim()
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const candidate = fenced ? fenced[1].trim() : text
  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')
  if (start < 0 || end <= start) {
    return { answer: candidate.slice(0, 800), ref_ids: [] }
  }
  try {
    const obj = JSON.parse(candidate.slice(start, end + 1))
    return {
      answer: String(obj.answer || '').trim() || candidate.slice(0, 800),
      ref_ids: Array.isArray(obj.ref_ids) ? obj.ref_ids.map(String) : [],
    }
  } catch (e) {
    return { answer: candidate.slice(0, 800), ref_ids: [] }
  }
}

function sseEvent(obj) {
  return 'data: ' + JSON.stringify(obj) + '\n\n'
}

module.exports = {
  chatWithQianfan,
  streamChatWithQianfan,
  parseModelJson,
  normalizeHistory,
  sseEvent,
}
