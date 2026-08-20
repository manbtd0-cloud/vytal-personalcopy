import { EventBus } from '../core/EventBus.js'

export class NetworkMonitor {
  #events = new EventBus()
  #started = false
  #handleOnline = () => this.#events.publish('change', true)
  #handleOffline = () => this.#events.publish('change', false)

  get online() {
    return typeof navigator === 'undefined' ? true : navigator.onLine
  }

  start() {
    if (this.#started || typeof window === 'undefined') return
    window.addEventListener('online', this.#handleOnline)
    window.addEventListener('offline', this.#handleOffline)
    this.#started = true
  }

  stop() {
    if (!this.#started || typeof window === 'undefined') return
    window.removeEventListener('online', this.#handleOnline)
    window.removeEventListener('offline', this.#handleOffline)
    this.#started = false
  }

  subscribe(listener) {
    this.start()
    listener(this.online)
    return this.#events.subscribe('change', listener)
  }
}

export const networkMonitor = new NetworkMonitor()
