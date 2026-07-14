/**
 * 千帆 Chat Completions（v2 Bearer）
 * 环境变量：QIANFAN_AK、QIANFAN_MODEL（可选）、QIANFAN_API_URL（可选）
 * 兼容 CFC nodejs12（无原生 fetch / 无可选链）
 */

const https = require('https')
const { URL } = require('url')

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

async function chatWithQianfan({ system, user, refs }) {
  const ak = process.env.QIANFAN_AK || process.env.QIANFAN_API_KEY
  if (!ak) {
    const err = new Error('未配置 QIANFAN_AK')
    err.code = 'DISABLED'
    throw err
  }

  const url =
    process.env.QIANFAN_API_URL ||
    'https://qianfan.baidubce.com/v2/chat/completions'
  const model = process.env.QIANFAN_MODEL || 'ernie-x1.1'

  const refBlock = (refs || [])
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

  const systemPrompt =
    system ||
    [
      '你是「曹宇春 learn 手册」只读助手。',
      '只能根据用户消息里提供的手册摘录回答；摘录没有的内容必须说「手册未覆盖」，禁止编造课名或细节。',
      '用简洁中文回答，建议不超过 400 字。',
      '在 JSON 中返回：{"answer":"...","ref_ids":["id1","id2"]}',
      'ref_ids 必须来自摘录中的 id，按相关性选 1～5 个；没有就 []。',
      '只输出一个 JSON 对象，不要 Markdown 代码围栏。',
    ].join('\n')

  const userPrompt =
    '用户问题：' + user + '\n\n手册摘录：\n' + (refBlock || '（无）')

  const res = await httpJson(
    'POST',
    url,
    { Authorization: 'Bearer ' + ak },
    {
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
    },
  )

  const data = res.data || {}
  if (!res.ok) {
    var msg = data.message || data.error_msg || data.error_description
    if (!msg && data.error) {
      msg =
        typeof data.error === 'string'
          ? data.error
          : data.error.message || JSON.stringify(data.error)
    }
    if (!msg) msg = '千帆 HTTP ' + res.status
    const err = new Error(msg)
    err.code = 'UPSTREAM'
    err.detail = data
    throw err
  }

  let content = ''
  if (
    data.choices &&
    data.choices[0] &&
    data.choices[0].message &&
    data.choices[0].message.content
  ) {
    content = data.choices[0].message.content
  } else if (data.result) {
    content = data.result
  } else if (data.answer) {
    content = data.answer
  }

  return { content: String(content), model: model, raw: data }
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

module.exports = { chatWithQianfan, parseModelJson }
