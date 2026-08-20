import { readFile } from 'node:fs/promises'
import { performance } from 'node:perf_hooks'
import { pathToFileURL } from 'node:url'
import { summarizeLoad } from './lib/performance-budget.mjs'

const MAX_REQUESTS = 5_000
const MAX_CONCURRENCY = 100

function boundedInteger(value, fallback, minimum, maximum, name) {
  const number = value === undefined ? fallback : Number(value)
  if (!Number.isInteger(number) || number < minimum || number > maximum) {
    throw new RangeError(`${name} must be an integer between ${minimum} and ${maximum}.`)
  }
  return number
}

function assertSafeCliTarget(target) {
  const url = new URL(target)
  const loopback = new Set(['localhost', '127.0.0.1', '::1', '[::1]'])
  if (!loopback.has(url.hostname) && process.env.VYTAL_ALLOW_REMOTE_LOAD_TEST !== '1') {
    throw new Error('Remote load tests require VYTAL_ALLOW_REMOTE_LOAD_TEST=1 and explicit target authorization.')
  }
}

export async function runLoadTest({
  target,
  totalRequests = 100,
  concurrency = 10,
  timeoutMs = 5_000,
  method = 'POST',
  headers = {},
  body,
  budget,
}) {
  const requestCount = boundedInteger(totalRequests, 100, 1, MAX_REQUESTS, 'requests')
  const workerCount = boundedInteger(concurrency, 10, 1, MAX_CONCURRENCY, 'concurrency')
  const requestTimeout = boundedInteger(timeoutMs, 5_000, 50, 60_000, 'timeout')
  if (!target || !budget) throw new Error('Load-test target and budget are required.')

  const results = new Array(requestCount)
  let nextIndex = 0
  const startedAt = performance.now()

  async function worker() {
    while (true) {
      const index = nextIndex++
      if (index >= requestCount) return
      const requestStartedAt = performance.now()
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort('load-test-timeout'), requestTimeout)
      try {
        const normalizedMethod = method.toUpperCase()
        const response = await fetch(target, {
          method: normalizedMethod,
          headers: { ...headers, 'X-Request-Id': `load-${crypto.randomUUID()}` },
          body: ['GET', 'HEAD'].includes(normalizedMethod) ? undefined : body,
          signal: controller.signal,
        })
        await response.arrayBuffer()
        results[index] = {
          ok: response.status >= 200 && response.status < 300,
          status: response.status,
          latencyMs: performance.now() - requestStartedAt,
        }
      } catch {
        results[index] = { ok: false, status: 0, latencyMs: performance.now() - requestStartedAt }
      } finally {
        clearTimeout(timeout)
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(workerCount, requestCount) }, () => worker()))
  return summarizeLoad(results, performance.now() - startedAt, budget)
}

async function runCli() {
  const target = process.env.VYTAL_LOAD_TARGET
  if (!target) throw new Error('Set VYTAL_LOAD_TARGET to an authorized local or remote endpoint.')
  assertSafeCliTarget(target)

  const budgets = JSON.parse(await readFile(new URL('../config/performance-budgets.json', import.meta.url), 'utf8'))
  const profile = process.env.VYTAL_LOAD_PROFILE ?? 'edgeFunction'
  const budget = budgets[profile]
  if (!budget) throw new Error(`Unknown performance budget profile: ${profile}`)

  const token = process.env.VYTAL_LOAD_TOKEN
  const rawBody = process.env.VYTAL_LOAD_BODY ?? '{}'
  JSON.parse(rawBody)
  const summary = await runLoadTest({
    target,
    totalRequests: process.env.VYTAL_LOAD_REQUESTS,
    concurrency: process.env.VYTAL_LOAD_CONCURRENCY,
    timeoutMs: process.env.VYTAL_LOAD_TIMEOUT_MS,
    method: process.env.VYTAL_LOAD_METHOD ?? 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Vytal-Load-Test': 'true',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: rawBody,
    budget,
  })
  console.log(JSON.stringify({ profile, ...summary }, null, 2))
  if (!summary.withinBudget) process.exitCode = 1
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli().catch((error) => {
    console.error(error instanceof Error ? error.message : 'Load test failed.')
    process.exitCode = 1
  })
}
