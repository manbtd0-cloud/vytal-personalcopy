export class PriorityQueue {
  #heap = []
  #compare

  constructor(compare = (a, b) => a - b) {
    if (typeof compare !== 'function') throw new TypeError('PriorityQueue requires a comparator.')
    this.#compare = compare
  }

  static from(values, compare) {
    const queue = new PriorityQueue(compare)
    queue.#heap = [...values]
    for (let index = Math.floor(queue.#heap.length / 2) - 1; index >= 0; index--) {
      queue.#siftDown(index)
    }
    return queue
  }

  get size() {
    return this.#heap.length
  }

  peek() {
    return this.#heap[0]
  }

  enqueue(value) {
    this.#heap.push(value)
    this.#siftUp(this.#heap.length - 1)
    return this.size
  }

  dequeue() {
    if (!this.#heap.length) return undefined
    const first = this.#heap[0]
    const last = this.#heap.pop()
    if (this.#heap.length) {
      this.#heap[0] = last
      this.#siftDown(0)
    }
    return first
  }

  toSortedArray() {
    const copy = PriorityQueue.from(this.#heap, this.#compare)
    const result = new Array(copy.size)
    for (let index = 0; index < result.length; index++) result[index] = copy.dequeue()
    return result
  }

  #siftUp(index) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2)
      if (this.#compare(this.#heap[index], this.#heap[parent]) >= 0) break
      ;[this.#heap[index], this.#heap[parent]] = [this.#heap[parent], this.#heap[index]]
      index = parent
    }
  }

  #siftDown(index) {
    while (true) {
      const left = index * 2 + 1
      const right = left + 1
      let best = index
      if (left < this.#heap.length && this.#compare(this.#heap[left], this.#heap[best]) < 0) best = left
      if (right < this.#heap.length && this.#compare(this.#heap[right], this.#heap[best]) < 0) best = right
      if (best === index) return
      ;[this.#heap[index], this.#heap[best]] = [this.#heap[best], this.#heap[index]]
      index = best
    }
  }
}
