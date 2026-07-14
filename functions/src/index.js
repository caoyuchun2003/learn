/**
 * 百度 CFC HTTP 入口
 * - POST /api/decide  规则决策（非 AI）
 * - POST /api/ask     问本站（千帆 + manifest 检索）
 */

const fs = require('fs')
const path = require('path')
const { decide } = require('./decideEngine.cjs')
const { retrieve, buildLocalAnswer } = require('./retrieve.cjs')
const { chatWithQianfan, parseModelJson } = require('./askQianfan.cjs')

const rateMap = new Map()
let manifestCache = null

function env(name, fallback = '') {
  return process.env[name] != null ? String(process.env[name]) : fallback
}

function featureOn(name) {
  const v = env(name, 'on').toLowerCase()
  return v !== 'off' && v !== '0' && v !== 'false'
}

function corsHeaders() {
  const origin = env('CORS_ORIGIN', 'https://caoyuchun2003.github.io')
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Learn-Token',
    'Access-Control-Max-Age': '600',
    'Content-Type': 'application/json; charset=utf-8',
  }
}

function response(statusCode, bodyObj) {
  return {
    isBase64Encoded: false,
    statusCode,
    headers: corsHeaders(),
    body: JSON.stringify(bodyObj),
  }
}

function getMethod(event) {
  return (
    event.httpMethod ||
    event.requestContext?.httpMethod ||
    event.method ||
    'GET'
  ).toUpperCase()
}

function getPath(event) {
  return String(
    event.path || event.resourcePath || event.requestContext?.path || '',
  )
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
  } catch {
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
  const windowMs = 60_000
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
    `learn_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
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
  if (p.includes('/api/ask') || p.endsWith('/ask')) return 'ask'
  if (p.includes('/api/decide') || p.endsWith('/decide')) return 'decide'
  // 兼容未带 path 的测试调用：看 body.action
  return null
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
  return response(200, {
    ...out.result,
    requestId: rid,
    mode: 'rule-engine',
  })
}

async function handleAsk(body, rid) {
  if (!featureOn('FEATURE_ASK')) {
    return response(503, {
      code: 'DISABLED',
      message: '问本站已关闭（FEATURE_ASK=off）',
      requestId: rid,
    })
  }

  const question = String(body.question || '').trim()
  if (!question) {
    return response(400, {
      code: 'BAD_REQUEST',
      message: 'question 不能为空',
      requestId: rid,
    })
  }
  if (question.length > 200) {
    return response(400, {
      code: 'BAD_REQUEST',
      message: 'question 最多 200 字',
      requestId: rid,
    })
  }

  const scope = String(body.scope || 'all')
  const manifest = loadManifest()
  const refs = retrieve(manifest.entries, question, scope, 5)

  // 无 Key：检索降级
  if (!env('QIANFAN_AK') && !env('QIANFAN_API_KEY')) {
    const local = buildLocalAnswer(question, refs)
    return response(200, { ...local, requestId: rid })
  }

  try {
    const { content, model } = await chatWithQianfan({
      user: question,
      refs,
    })
    const parsed = parseModelJson(content)
    const idSet = new Set(parsed.ref_ids)
    let picked = refs.filter((r) => idSet.has(r.id))
    if (!picked.length) picked = refs.slice(0, 3)

    return response(200, {
      answer: parsed.answer,
      refs: picked.map(({ id, title, path, snippet }) => ({
        id,
        title,
        path,
        snippet,
      })),
      model,
      requestId: rid,
      mode: 'qianfan',
    })
  } catch (e) {
    const code = e.code || 'UPSTREAM'
    const status = code === 'DISABLED' ? 503 : 502
    return response(status, {
      code,
      message: e.message || '上游调用失败',
      requestId: rid,
      refs,
    })
  }
}

exports.handler = async (event = {}, context = {}) => {
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
      endpoints: ['POST /api/decide', 'POST /api/ask'],
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
  if (!route && body.action === 'ask') route = 'ask'
  if (!route && body.action === 'decide') route = 'decide'
  if (!route && body.question) route = 'ask'
  if (!route) route = 'decide'

  if (route === 'ask') return handleAsk(body, rid)
  return handleDecide(body, rid)
}
