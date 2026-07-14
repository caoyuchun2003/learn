/**
 * 问本站：优先 SSE（/api/ask/stream），CFC 整包缓冲或失败时 → JSON + 假流式。
 */

function sleep(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms)
  })
}

export async function typewriter(text, onDelta, opts) {
  const full = String(text || '')
  const cps = (opts && opts.charsPerTick) || 3
  const delay = (opts && opts.delayMs) || 18
  let i = 0
  while (i < full.length) {
    const next = full.slice(i, i + cps)
    i += cps
    onDelta(next)
    await sleep(delay)
  }
}

function parseSseChunk(buffer, onEvent) {
  const parts = buffer.split('\n\n')
  const rest = parts.pop() || ''
  for (let i = 0; i < parts.length; i++) {
    const block = parts[i]
    const lines = block.split('\n')
    for (let j = 0; j < lines.length; j++) {
      const line = lines[j]
      if (!line.startsWith('data:')) continue
      const raw = line.slice(5).trim()
      if (!raw || raw === '[DONE]') continue
      try {
        onEvent(JSON.parse(raw))
      } catch {
        // ignore
      }
    }
  }
  return rest
}

/**
 * @param {object} options
 * @param {string} options.apiBase
 * @param {string} options.question
 * @param {string} options.scope
 * @param {Array} options.history
 * @param {(e:any)=>void} options.onMeta
 * @param {(t:string)=>void} options.onDelta
 * @param {(e:any)=>void} options.onDone
 * @param {(e:Error)=>void} options.onError
 */
export async function askWithStreamFallback(options) {
  const apiBase = (options.apiBase || '').replace(/\/$/, '')
  const payload = {
    question: options.question,
    scope: options.scope || 'all',
    history: options.history || [],
    client: 'learn-web',
  }
  const onMeta = options.onMeta || function () {}
  const onDelta = options.onDelta || function () {}
  const onDone = options.onDone || function () {}
  const onError = options.onError || function () {}

  if (apiBase) {
    try {
      // 1) 优先专用 SSE 路径；404 时改走 /api/ask + stream:true（兼容未挂新触发器）
      let res = await fetch(apiBase + '/api/ask/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
        body: JSON.stringify(payload),
      })
      if (res.status === 404) {
        res = await fetch(apiBase + '/api/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
          body: JSON.stringify(Object.assign({}, payload, { stream: true })),
        })
      }

      const ct = (res.headers.get('content-type') || '').toLowerCase()
      if (res.ok && ct.includes('text/event-stream') && res.body) {
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buf = ''
        let answer = ''
        let refs = []
        let model = ''
        let mode = 'qianfan'
        let requestId = ''
        let firstDeltaAt = 0
        let lastDeltaAt = 0
        let deltaEvents = 0
        let donePayload = null

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const now = Date.now()
          buf += decoder.decode(value, { stream: true })
          buf = parseSseChunk(buf, function (ev) {
            if (ev.type === 'meta') {
              refs = ev.refs || []
              requestId = ev.requestId || requestId
              onMeta(ev)
            } else if (ev.type === 'delta' && ev.text) {
              deltaEvents += 1
              if (!firstDeltaAt) firstDeltaAt = now
              lastDeltaAt = now
              answer += ev.text
              onDelta(ev.text)
            } else if (ev.type === 'done') {
              donePayload = ev
              if (ev.answer) answer = ev.answer
              if (ev.refs) refs = ev.refs
              if (ev.model) model = ev.model
              if (ev.mode) mode = ev.mode
              if (ev.requestId) requestId = ev.requestId
            } else if (ev.type === 'error') {
              throw new Error(ev.message || ev.code || 'stream error')
            }
          })
        }

        const span = lastDeltaAt && firstDeltaAt ? lastDeltaAt - firstDeltaAt : 0
        // CFC 网关常把 SSE 攒成一包：多个 delta 在极短时间内到齐 → 假流式回放
        const wasBuffered = span < 150

        if (wasBuffered && answer) {
          if (typeof options.onReplayStart === 'function') {
            options.onReplayStart()
          }
          await typewriter(answer, onDelta, { charsPerTick: 2, delayMs: 16 })
        }

        onDone({
          answer: answer,
          refs: refs,
          model: model,
          mode: mode,
          requestId: requestId || 'sse',
          streamMode: wasBuffered ? 'fake' : 'sse',
        })
        return
      }

      // 非 SSE：尝试 JSON
      if (res.ok) {
        const data = await res.json()
        if (data.answer) {
          onMeta({ refs: data.refs || [], requestId: data.requestId })
          if (typeof options.onReplayStart === 'function') options.onReplayStart()
          await typewriter(data.answer, onDelta)
          onDone({
            answer: data.answer,
            refs: data.refs || [],
            model: data.model,
            mode: data.mode || 'qianfan',
            requestId: data.requestId,
            streamMode: 'fake',
          })
          return
        }
      }
      throw new Error('stream endpoint unavailable')
    } catch (e) {
      console.warn('SSE/stream failed, try /api/ask', e)
    }

    // JSON 整包 + 假流式
    try {
      const res = await fetch(apiBase + '/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || data.code || 'HTTP ' + res.status)
      }
      onMeta({ refs: data.refs || [], requestId: data.requestId })
      if (typeof options.onReplayStart === 'function') options.onReplayStart()
      await typewriter(data.answer || '', onDelta)
      onDone({
        answer: data.answer || '',
        refs: data.refs || [],
        model: data.model,
        mode: data.mode === 'qianfan' ? 'qianfan' : 'cfc-retrieve',
        requestId: data.requestId,
        streamMode: 'fake',
      })
      return
    } catch (e) {
      console.warn('CFC ask failed', e)
      onError(e)
      throw e
    }
  }

  throw new Error('NO_API')
}
