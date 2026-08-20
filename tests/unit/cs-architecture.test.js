import test from 'node:test'
import assert from 'node:assert/strict'
import { CircularBuffer } from '../../src/core/CircularBuffer.js'
import { EventBus } from '../../src/core/EventBus.js'
import { MemoryOutbox } from '../../src/core/MemoryOutbox.js'
import { PriorityQueue } from '../../src/core/PriorityQueue.js'
import { clinicalRiskPolicy } from '../../src/domain/clinical/ClinicalRiskPolicy.js'
import { ReferralPriorityQueue, referralWorkflow } from '../../src/domain/referrals/ReferralWorkflow.js'
import { FaceScanStrategy, FingertipScanStrategy, ScanStrategyFactory } from '../../src/domain/scanning/ScanStrategy.js'
import { applyDescendingCursor, boundedPageSize, pageResult } from '../../src/lib/pagination.js'
import { QUALITY_FLAGS, createQualityMask, hasQualityFlag } from '../../src/lib/qualityFlags.js'
import { packSamples, unpackSamples } from '../../src/lib/sampleTransport.js'

test('CircularBuffer overwrites the oldest item in O(1) ring order', () => {
  const buffer = new CircularBuffer(3)
  buffer.push('a'); buffer.push('b'); buffer.push('c'); buffer.push('d')
  assert.deepEqual(buffer.toArray(), ['b', 'c', 'd'])
  assert.equal(buffer.at(-1), 'd')
})

test('PriorityQueue dequeues minimum values in heap order', () => {
  const queue = new PriorityQueue((left, right) => left - right)
  for (const value of [9, 2, 7, 1, 4]) queue.enqueue(value)
  assert.deepEqual([queue.dequeue(), queue.dequeue(), queue.dequeue()], [1, 2, 4])
})

test('EventBus implements subscribe, publish, and unsubscribe observer behavior', () => {
  const events = new EventBus()
  const received = []
  const unsubscribe = events.subscribe('scan', (value) => received.push(value))
  assert.equal(events.publish('scan', 1), 1)
  unsubscribe()
  assert.equal(events.publish('scan', 2), 0)
  assert.deepEqual(received, [1])
})

test('MemoryOutbox drains commands in FIFO order and retains failures', async () => {
  const outbox = new MemoryOutbox(3)
  outbox.enqueue({ id: 1 }); outbox.enqueue({ id: 2 })
  const processed = []
  assert.equal(await outbox.drain(async (command) => processed.push(command.id)), 2)
  assert.deepEqual(processed, [1, 2])
  assert.equal(outbox.size, 0)
  outbox.enqueue({ id: 3 })
  await assert.rejects(outbox.drain(async () => { throw new Error('offline') }), /offline/)
  assert.equal(outbox.peek().id, 3)
})

test('scan factory returns polymorphic strategies', () => {
  assert.ok(ScanStrategyFactory.create('face') instanceof FaceScanStrategy)
  assert.ok(ScanStrategyFactory.create('fingertip') instanceof FingertipScanStrategy)
  assert.equal(ScanStrategyFactory.create('fingertip').assessContact({ r: 100, g: 80, b: 50 }, true).detected, true)
})

test('referral graph enforces sequential care transitions and paths', () => {
  assert.equal(referralWorkflow.canTransition('flagged', 'referred'), true)
  assert.equal(referralWorkflow.canTransition('flagged', 'completed'), false)
  assert.deepEqual(referralWorkflow.shortestPath('flagged', 'completed'), [
    'flagged', 'referred', 'contacted', 'appointment_booked', 'completed',
  ])
})

test('referral heap prioritizes urgent and earliest due cases', () => {
  const queue = new ReferralPriorityQueue([
    { id: 'routine', priority: 'routine', due_at: '2026-08-20T00:00:00Z' },
    { id: 'later', priority: 'urgent', due_at: '2026-08-21T00:00:00Z' },
    { id: 'first', priority: 'urgent', due_at: '2026-08-19T00:00:00Z' },
  ])
  assert.deepEqual(queue.toSortedArray().map((item) => item.id), ['first', 'later', 'routine'])
})

test('clinical policy encapsulates thresholds consistently', () => {
  assert.equal(clinicalRiskPolicy.evaluate({ heartRate: 121, breathingRate: 16, stressScore: 20 }).flagged, true)
  assert.equal(clinicalRiskPolicy.evaluate({ heartRate: 110, breathingRate: 16, stressScore: 20 }).tier, 'YELLOW')
  assert.equal(clinicalRiskPolicy.evaluate({ heartRate: 110, breathingRate: 16, stressScore: 20 }).flagged, false)
  assert.equal(clinicalRiskPolicy.evaluate({ heartRate: 75, breathingRate: 16, stressScore: 20 }).flagged, false)
  assert.equal(clinicalRiskPolicy.stressLabel(70), 'High')
})

test('typed sample transport round-trips through Float64 memory', () => {
  const input = [{ t: 0, r: 1.5, g: 2.5, b: 3.5 }, { t: 33.3, r: 4, g: 5, b: 6 }]
  const packed = packSamples(input)
  assert.ok(packed instanceof Float64Array)
  assert.deepEqual(unpackSamples(packed.buffer, input.length), input)
})

test('quality flags use independent bit positions', () => {
  const mask = createQualityMask({
    camera: { fps: 15, megapixels: 0.3 }, lightingTier: 'poor', motionTier: 'large', uncertainty: { reliable: false },
  })
  assert.equal(hasQualityFlag(mask, QUALITY_FLAGS.LOW_FRAME_RATE), true)
  assert.equal(hasQualityFlag(mask, QUALITY_FLAGS.EXCESSIVE_MOTION), true)
  assert.equal(hasQualityFlag(mask, QUALITY_FLAGS.UNRELIABLE_SIGNAL), true)
})

test('cursor pagination validates bounds and builds a tie-breaker filter', () => {
  assert.equal(boundedPageSize(500, 25, 100), 100)
  const calls = []
  const query = { or: (filter) => { calls.push(filter); return query } }
  const cursor = { timestamp: '2026-08-19T12:00:00.000Z', id: '40000000-0000-4000-8000-000000000001' }
  assert.equal(applyDescendingCursor(query, 'observed_at', cursor), query)
  assert.match(calls[0], /observed_at\.lt\..*id\.lt\./)
  assert.deepEqual(pageResult([{ id: 1 }, { id: 2 }, { id: 3 }], 2, 'created_at').items, [{ id: 1 }, { id: 2 }])
})
