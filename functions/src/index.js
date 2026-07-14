/**
 * 百度 CFC HTTP 入口
 * - POST /api/decide
 * - POST /api/ask
 * - POST /api/ask/stream  (SSE；CFC 可能缓冲整包，前端可假流式兜底)
 */

const fs = require('fs')
const path = require('path')
const { decide } = require('./decideEngine.cjs')
const { retrieve, buildLocalAnswer } = require('./retrieve.cjs')
const {
  chatWithQianfan,
  streamChatWithQianfan,
  parseModelJson,
  normalizeHistory,
  sseEvent,
} = require('./askQianfan.cjs')

const rateMap = new Map()
let manifestCache = null

function env(name, fallback) {
  if (fallback === undefined) fallback = ''
  return process.env[name] != null ? String(process.env[name]) : fallback
}

function featureOn(name) {
  const v = env(name, 'on').toLowerCase()
  return v !== 'off' && v !== '0' && v !== 'false'
}

function corsHeaders(extra) {
  const origin = env('CORS_ORIGIN', 'https://caoyuchun2003.github.io')
  return Object.assign(
    {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Learn-Token',
      'Access-Control-Max-Age': '600',
      'Content-Type': 'application/json; charset=utf-8',
    },
    extra || {},
  )
}

function response(statusCode, bodyObj) {
  return {
    isBase64Encoded: false,
    statusCode: statusCode,
    headers: corsHeaders(),
    body: JSON.stringify(bodyObj),
  }
}

function sseResponse(statusCode, sseBody) {
  return {
    isBase64Encoded: false,
    statusCode: statusCode,
    headers: corsHeaders({
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    }),
    body: sseBody,
  }
}

function getMethod(event) {
  const rc = event.requestContext || {}
  return (
    event.httpMethod ||
    rc.httpMethod ||
    event.method ||
    'GET'
  ).toUpperCase()
}

function getPath(event) {
  const rc = event.requestContext || {}
  return String(event.path || event.resourcePath || rc.path || '')
}

function parseBody(event) {
  let raw = event.body
  if (raw == null || raw === '') return {}
  if (event.isBase64Encoded && typeof raw === 'string') {
    raw = Buffer.from(raw, 'base64').toString('utf8')
  }
  if (typeof raw === 'object') return raw
  try {
    return JSON.parse(raw)
  } catch (e) {
    return null
  }
}

function clientIp(event) {
  const h = event.headers || {}
  return (
    h['X-Forwarded-For'] ||
    h['x-forwarded-for'] ||
    h['X-Real-Ip'] ||
    h['x-real-ip'] ||
    'unknown'
  )
    .toString()
    .split(',')[0]
    .trim()
}

function rateLimit(ip) {
  const limit = Number(env('RATE_LIMIT_PER_MIN', '20')) || 20
  const now = Date.now()
  const windowMs = 60000
  let bucket = rateMap.get(ip)
  if (!bucket || now - bucket.start > windowMs) {
    bucket = { start: now, count: 0 }
    rateMap.set(ip, bucket)
  }
  bucket.count += 1
  return bucket.count <= limit
}

function requestId(context) {
  return (
    context.requestId ||
    'learn_' +
      Date.now().toString(36) +
      '_' +
      Math.random().toString(36).slice(2, 8)
  )
}

function loadManifest() {
  if (manifestCache) return manifestCache
  const p = path.join(__dirname, '..', 'data', 'manifest.json')
  manifestCache = JSON.parse(fs.readFileSync(p, 'utf8'))
  return manifestCache
}

function routeKey(event) {
  const p = getPath(event).toLowerCase()
  if (p.includes('/api/ask/stream') || p.endsWith('/ask/stream'))
    return 'ask-stream'
  if (p.includes('/api/ask') || p.endsWith('/ask')) return 'ask'
  if (p.includes('/api/decide') || p.endsWith('/decide')) return 'decide'
  return null
}

function mapRefs(refs) {
  return (refs || []).map(function (r) {
    return {
      id: r.id,
      title: r.title,
      path: r.path,
      snippet: r.snippet,
    }
  })
}

function validateAskBody(body) {
  const question = String(body.question || '').trim()
  if (!question) {
    return { error: 'question 不能为空' }
  }
  if (question.length > 200) {
    return { error: 'question 最多 200 字' }
  }
  return {
    question: question,
    scope: String(body.scope || 'all'),
    history: normalizeHistory(body.history),
  }
}

async function handleDecide(body, rid) {
  if (!featureOn('FEATURE_DECIDE')) {
    return response(503, {
      code: 'DISABLED',
      message: '决策器已关闭（FEATURE_DECIDE=off）',
      requestId: rid,
    })
  }
  const out = decide(body)
  if (!out.ok) {
    return response(400, {
      code: 'BAD_REQUEST',
      message: out.error,
      requestId: rid,
    })
  }
  return response(200, Object.assign({}, out.result, {
    requestId: rid,
    mode: 'rule-engine',
  }))
}

async function handleAsk(body, rid) {
  if (!featureOn('FEATURE_ASK')) {
    return response(503, {
      code: 'DISABLED',
      message: '问本站已关闭（FEATURE_ASK=off）',
      requestId: rid,
    })
  }

  const v = validateAskBody(body)
  if (v.error) {
    return response(400, {
      code: 'BAD_REQUEST',
      message: v.error,
      requestId: rid,
    })
  }

  const manifest = loadManifest()
  const refs = retrieve(manifest.entries, v.question, v.scope, 5)

  if (!env('QIANFAN_AK') && !env('QIANFAN_API_KEY')) {
    const local = buildLocalAnswer(v.question, refs)
    return response(200, Object.assign({}, local, { requestId: rid }))
  }

  try {
    const out = await chatWithQianfan({
      user: v.question,
      refs: refs,
      history: v.history,
    })
    const parsed = parseModelJson(out.content)
    const idSet = {}
    for (var i = 0; i < parsed.ref_ids.length; i++) {
      idSet[parsed.ref_ids[i]] = true
    }
    var picked = refs.filter(function (r) {
      return idSet[r.id]
    })
    if (!picked.length) picked = refs.slice(0, 3)

    return response(200, {
      answer: parsed.answer,
      refs: mapRefs(picked),
      model: out.model,
      requestId: rid,
      mode: 'qianfan',
    })
  } catch (e) {
    const code = e.code || 'UPSTREAM'
    const status = code === 'DISABLED' ? 503 : 502
    return response(status, {
      code: code,
      message: e.message || '上游调用失败',
      requestId: rid,
      refs: mapRefs(refs),
    })
  }
}

/**
 * 组装 SSE。注意：CFC HTTP 触发器通常整包返回；
 * 前端根据到达节奏决定真流式展示或假流式回放。
 */
async function handleAskStream(body, rid) {
  if (!featureOn('FEATURE_ASK')) {
    return sseResponse(
      503,
      sseEvent({
        type: 'error',
        code: 'DISABLED',
        message: '问本站已关闭（FEATURE_ASK=off）',
        requestId: rid,
      }),
    )
  }

  const v = validateAskBody(body)
  if (v.error) {
    return sseResponse(
      400,
      sseEvent({
        type: 'error',
        code: 'BAD_REQUEST',
        message: v.error,
        requestId: rid,
      }),
    )
  }

  const manifest = loadManifest()
  const refs = retrieve(manifest.entries, v.question, v.scope, 5)
  const picked = mapRefs(refs.slice(0, 5))

  let parts = ''
  parts += sseEvent({
    type: 'meta',
    requestId: rid,
    refs: picked,
    streamHint: 'cfc-may-buffer',
  })

  if (!env('QIANFAN_AK') && !env('QIANFAN_API_KEY')) {
    const local = buildLocalAnswer(v.question, refs)
    const answer = local.answer || ''
    // 分片写入，便于前端假流式
    var step = 12
    for (var i = 0; i < answer.length; i += step) {
      parts += sseEvent({ type: 'delta', text: answer.slice(i, i + step) })
    }
    parts += sseEvent({
      type: 'done',
      answer: answer,
      refs: mapRefs(local.refs || refs),
      mode: local.mode || 'local-retrieve',
      requestId: rid,
      buffered: true,
    })
    return sseResponse(200, parts)
  }

  try {
    const deltas = []
    const out = await streamChatWithQianfan({
      user: v.question,
      refs: refs,
      history: v.history,
      onDelta: function (t) {
        deltas.push(t)
      },
    })
    for (var d = 0; d < deltas.length; d++) {
      parts += sseEvent({ type: 'delta', text: deltas[d] })
    }
    // 若模型几乎没吐 delta（少数实现），用整段再切片
    var answer = String(out.content || '').trim()
    if (!deltas.length && answer) {
      var step2 = 16
      for (var j = 0; j < answer.length; j += step2) {
        parts += sseEvent({ type: 'delta', text: answer.slice(j, j + step2) })
      }
    }
    parts += sseEvent({
      type: 'done',
      answer: answer,
      refs: picked,
      model: out.model,
      mode: 'qianfan',
      requestId: rid,
      buffered: true,
    })
    return sseResponse(200, parts)
  } catch (e) {
    parts += sseEvent({
      type: 'error',
      code: e.code || 'UPSTREAM',
      message: e.message || '上游调用失败',
      requestId: rid,
      refs: picked,
    })
    return sseResponse(e.code === 'DISABLED' ? 503 : 502, parts)
  }
}

exports.handler = async function (event, context) {
  event = event || {}
  context = context || {}
  const rid = requestId(context)
  const method = getMethod(event)

  if (method === 'OPTIONS') {
    return {
      isBase64Encoded: false,
      statusCode: 204,
      headers: corsHeaders(),
      body: '',
    }
  }

  if (method === 'GET') {
    return response(200, {
      service: 'learn-cfc',
      endpoints: [
        'POST /api/decide',
        'POST /api/ask',
        'POST /api/ask/stream',
      ],
      featureDecide: featureOn('FEATURE_DECIDE'),
      featureAsk: featureOn('FEATURE_ASK'),
      hasQianfanKey: Boolean(env('QIANFAN_AK') || env('QIANFAN_API_KEY')),
      requestId: rid,
    })
  }

  if (method !== 'POST') {
    return response(405, {
      code: 'BAD_REQUEST',
      message: '仅支持 POST/OPTIONS/GET',
      requestId: rid,
    })
  }

  if (!rateLimit(clientIp(event))) {
    return response(429, {
      code: 'RATE_LIMIT',
      message: '请求过于频繁，请稍后再试',
      requestId: rid,
    })
  }

  const body = parseBody(event)
  if (body == null) {
    return response(400, {
      code: 'BAD_REQUEST',
      message: 'JSON body 无效',
      requestId: rid,
    })
  }

  let route = routeKey(event)
  if (!route && body.action === 'ask-stream') route = 'ask-stream'
  if (!route && body.action === 'ask') route = 'ask'
  if (!route && body.action === 'decide') route = 'decide'
  if (!route && body.stream) route = 'ask-stream'
  if (!route && body.question) route = 'ask'
  if (!route) route = 'decide'

  if (route === 'ask-stream') return handleAskStream(body, rid)
  if (route === 'ask') {
    // 兼容：触发器未加 /api/ask/stream 时，用同路径 + stream:true
    if (body.stream === true || body.stream === 'true' || body.action === 'ask-stream') {
      return handleAskStream(body, rid)
    }
    return handleAsk(body, rid)
  }
  return handleDecide(body, rid)
}
