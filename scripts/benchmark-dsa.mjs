import { performance } from 'node:perf_hooks'
import { CircularBuffer } from '../src/core/CircularBuffer.js'
import { PriorityQueue } from '../src/core/PriorityQueue.js'

const OPERATIONS = 100_000
const CAPACITY = 1_024

function measure(label, operation) {
  const started = performance.now()
  const result = operation()
  const elapsed = performance.now() - started
  console.log(`${label}: ${elapsed.toFixed(2)} ms`)
  return result
}

measure('CircularBuffer bounded writes', () => {
  const buffer = new CircularBuffer(CAPACITY)
  for (let index = 0; index < OPERATIONS; index++) buffer.push(index)
  if (buffer.length !== CAPACITY || buffer.at(-1) !== OPERATIONS - 1) throw new Error('CircularBuffer benchmark invariant failed.')
})

measure('Array push/shift bounded writes', () => {
  const values = []
  for (let index = 0; index < OPERATIONS; index++) {
    values.push(index)
    if (values.length > CAPACITY) values.shift()
  }
  if (values.length !== CAPACITY) throw new Error('Array benchmark invariant failed.')
})

measure('Binary heap enqueue/dequeue', () => {
  const queue = new PriorityQueue((left, right) => left - right)
  for (let index = 10_000; index > 0; index--) queue.enqueue(index)
  let previous = -Infinity
  while (queue.size) {
    const current = queue.dequeue()
    if (current < previous) throw new Error('PriorityQueue benchmark invariant failed.')
    previous = current
  }
})

console.log('Benchmark complete. Timings are descriptive; correctness tests remain the deployment gate.')
