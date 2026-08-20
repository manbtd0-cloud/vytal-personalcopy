export class MemoryOutbox {
  #queue = []
  #head = 0
  #drainPromise = null

  constructor(capacity = 50) {
    if (!Number.isInteger(capacity) || capacity < 1) throw new TypeError('Outbox capacity must be positive.')
    this.capacity = capacity
  }

  get size() {
    return this.#queue.length - this.#head
  }

  enqueue(command) {
    if (this.size >= this.capacity) throw new Error('Offline command queue is full.')
    this.#queue.push(Object.freeze({ ...command }))
    return this.size
  }

  peek() {
    return this.#queue[this.#head]
  }

  drain(handler) {
    if (this.#drainPromise) return this.#drainPromise
    this.#drainPromise = this.#drain(handler).finally(() => {
      this.#drainPromise = null
    })
    return this.#drainPromise
  }

  async #drain(handler) {
    let processed = 0
    while (this.#head < this.#queue.length) {
      await handler(this.#queue[this.#head])
      this.#head++
      processed++
    }
    this.#queue = []
    this.#head = 0
    return processed
  }
}
