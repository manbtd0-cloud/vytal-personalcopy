import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { once } from 'node:events'
import { MemoryOutbox } from '../../src/core/MemoryOutbox.js'
import { runLoadTest } from '../../scripts/load-test.mjs'
import { percentile, summarizeLoad } from '../../scripts/lib/performance-budget.mjs'

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))

test('concurrent outbox drains share one in-flight operation', async () => {
  const outbox = new MemoryOutbox(10)
  for (const id of [1, 2, 3]) outbox.enqueue({ id })
  const processed = []
  const first = outbox.drain(async ({ id }) => {
    await delay(2)
    processed.push(id)
  })
  const second = outbox.drain(async () => {
    throw new Error('a second drain handler must never run')
  })

  assert.deepEqual(await Promise.all([first, second]), [3, 3])
  assert.deepEqual(processed, [1, 2, 3])
  assert.equal(outbox.size, 0)
})

test('bounded load harness sends concurrent requests and evaluates budgets', async (context) => {
  let active = 0
  let maxActive = 0
  const requestIds = new Set()
  const server = createServer(async (req, res) => {
    active++
    maxActive = Math.max(maxActive, active)
    requestIds.add(req.headers['x-request-id'])
    await delay(10)
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end('{"ok":true}')
    active--
  })
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  context.after(() => server.close())
  const { port } = server.address()

  const summary = await runLoadTest({
    target: `http://127.0.0.1:${port}/health`,
    totalRequests: 24,
    concurrency: 6,
    method: 'GET',
    timeoutMs: 2_000,
    budget: { p95Ms: 1_000, p99Ms: 2_000, maxErrorRate: 0 },
  })

  assert.equal(summary.requests, 24)
  assert.equal(summary.failed, 0)
  assert.equal(summary.withinBudget, true)
  assert.equal(requestIds.size, 24)
  assert.ok(maxActive >= 2, 'the harness should exercise actual request concurrency')
})

test('performance summaries use deterministic percentiles and fail closed on violations', () => {
  assert.equal(percentile([50, 10, 40, 20, 30], 0), 10)
  assert.equal(percentile([50, 10, 40, 20, 30], 0.95), 50)
  const summary = summarizeLoad([
    { ok: true, status: 200, latencyMs: 20 },
    { ok: false, status: 503, latencyMs: 100 },
  ], 120, { p95Ms: 50, p99Ms: 75, maxErrorRate: 0.1 })
  assert.equal(summary.withinBudget, false)
  assert.equal(summary.errorRate, 0.5)
  assert.equal(summary.violations.length, 3)
})
