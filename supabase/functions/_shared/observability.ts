const REQUEST_ID_PATTERN = /^[A-Za-z0-9._:-]{8,128}$/

type LogLevel = 'info' | 'warn' | 'error'
type LogDetails = Record<string, string | number | boolean | null | undefined>

function acceptedRequestId(req: Request) {
  const supplied = req.headers.get('x-request-id')?.trim() ?? ''
  return REQUEST_ID_PATTERN.test(supplied) ? supplied : crypto.randomUUID()
}

export class RequestTrace {
  readonly requestId: string
  readonly functionName: string
  readonly startedAt = performance.now()

  constructor(req: Request, functionName: string) {
    this.requestId = acceptedRequestId(req)
    this.functionName = functionName
  }

  log(level: LogLevel, event: string, details: LogDetails = {}) {
    const entry = JSON.stringify({
      ...details,
      timestamp: new Date().toISOString(),
      level,
      event,
      function: this.functionName,
      request_id: this.requestId,
    })
    if (level === 'error') console.error(entry)
    else if (level === 'warn') console.warn(entry)
    else console.info(entry)
  }

  attach(response: Response, event = 'request.completed', details: LogDetails = {}) {
    const durationMs = Number((performance.now() - this.startedAt).toFixed(2))
    const headers = new Headers(response.headers)
    headers.set('X-Request-Id', this.requestId)
    headers.set('Server-Timing', `app;dur=${durationMs}`)
    headers.set('Cache-Control', 'no-store')
    this.log(response.status >= 500 ? 'error' : response.status >= 400 ? 'warn' : 'info', event, {
      status: response.status,
      duration_ms: durationMs,
      ...details,
    })
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  }
}
