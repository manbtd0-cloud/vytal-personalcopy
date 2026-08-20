const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504])

function retryDelay(response: Response | null, attempt: number, baseDelayMs: number) {
  const retryAfter = response?.headers.get('retry-after')
  if (retryAfter) {
    const seconds = Number(retryAfter)
    if (Number.isFinite(seconds)) return Math.min(5_000, Math.max(0, seconds * 1_000))
  }
  const exponential = baseDelayMs * (2 ** attempt)
  const jitter = Math.floor(Math.random() * Math.max(1, baseDelayMs))
  return Math.min(5_000, exponential + jitter)
}

function sleep(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

export async function fetchWithResilience(
  input: string | URL,
  init: RequestInit,
  { attempts = 2, timeoutMs = 15_000, baseDelayMs = 150 } = {},
) {
  if (!Number.isInteger(attempts) || attempts < 1 || attempts > 4) {
    throw new Error('Network attempts must be between 1 and 4.')
  }

  let lastError: unknown = null
  for (let attempt = 0; attempt < attempts; attempt++) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort('upstream-timeout'), timeoutMs)
    let response: Response | null = null
    try {
      response = await fetch(input, { ...init, signal: controller.signal })
      if (!RETRYABLE_STATUS.has(response.status) || attempt === attempts - 1) return response
      await response.body?.cancel()
    } catch (error) {
      lastError = error
      if (attempt === attempts - 1) throw error
    } finally {
      clearTimeout(timeout)
    }
    await sleep(retryDelay(response, attempt, baseDelayMs))
  }

  throw lastError instanceof Error ? lastError : new Error('Upstream request failed.')
}
