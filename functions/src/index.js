/**
 * 百度 CFC HTTP 入口：POST /api/decide
 * 事件字段以 CFC HTTP 触发器文档为准，做了宽松兼容。
 */

const { decide } = require('./decideEngine.cjs')

const rateMap = new Map()

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
  return event.path || event.resourcePath || event.requestContext?.path || ''
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
  const limit = Number(env('RATE_LIMIT_PER_MIN', '30')) || 30
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

function requestId() {
  return `learn_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

exports.handler = async (event = {}, context = {}) => {
  const rid = context.requestId || requestId()
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
      endpoints: ['POST /api/decide'],
      featureDecide: featureOn('FEATURE_DECIDE'),
      requestId: rid,
    })
  }

  if (method !== 'POST') {
    return response(405, { code: 'BAD_REQUEST', message: '仅支持 POST/OPTIONS/GET', requestId: rid })
  }

  if (!featureOn('FEATURE_DECIDE')) {
    return response(503, {
      code: 'DISABLED',
      message: '决策器已关闭（FEATURE_DECIDE=off）',
      requestId: rid,
    })
  }

  const ip = clientIp(event)
  if (!rateLimit(ip)) {
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
