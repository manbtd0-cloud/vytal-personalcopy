export class EventBus {
  #listeners = new Map()

  subscribe(eventName, listener) {
    if (typeof listener !== 'function') throw new TypeError('Observer must be a function.')
    const listeners = this.#listeners.get(eventName) ?? new Set()
    listeners.add(listener)
    this.#listeners.set(eventName, listeners)
    return () => this.unsubscribe(eventName, listener)
  }

  unsubscribe(eventName, listener) {
    const listeners = this.#listeners.get(eventName)
    if (!listeners) return false
    const removed = listeners.delete(listener)
    if (!listeners.size) this.#listeners.delete(eventName)
    return removed
  }

  publish(eventName, payload) {
    const listeners = this.#listeners.get(eventName)
    if (!listeners) return 0
    for (const listener of [...listeners]) listener(payload)
    return listeners.size
  }

  clear() {
    this.#listeners.clear()
  }
}

export const applicationEvents = new EventBus()
