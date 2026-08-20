export class CircularBuffer {
  #storage
  #head = 0
  #size = 0

  constructor(capacity) {
    if (!Number.isInteger(capacity) || capacity < 1) {
      throw new TypeError('CircularBuffer capacity must be a positive integer.')
    }
    this.capacity = capacity
    this.#storage = new Array(capacity)
  }

  get length() {
    return this.#size
  }

  get isFull() {
    return this.#size === this.capacity
  }

  push(value) {
    const tail = (this.#head + this.#size) % this.capacity
    this.#storage[tail] = value
    if (this.#size === this.capacity) {
      this.#head = (this.#head + 1) % this.capacity
    } else {
      this.#size++
    }
    return this.#size
  }

  at(index) {
    const normalized = index < 0 ? this.#size + index : index
    if (normalized < 0 || normalized >= this.#size) return undefined
    return this.#storage[(this.#head + normalized) % this.capacity]
  }

  clear() {
    this.#storage.fill(undefined)
    this.#head = 0
    this.#size = 0
  }

  toArray() {
    const result = new Array(this.#size)
    for (let index = 0; index < this.#size; index++) {
      result[index] = this.#storage[(this.#head + index) % this.capacity]
    }
    return result
  }
}
