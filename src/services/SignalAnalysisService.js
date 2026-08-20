import { analyzeSignal } from '../lib/rppg.js'
import { packSamples } from '../lib/sampleTransport.js'

export class SignalAnalysisService {
  #worker = null
  #pending = new Map()
  #nextRequestId = 1

  async analyze(samples) {
    if (typeof Worker === 'undefined') return analyzeSignal(samples)
    const worker = this.#getWorker()
    const packed = packSamples(samples)
    const requestId = this.#nextRequestId++

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.#pending.delete(requestId)
        reject(new Error('Signal worker timed out.'))
      }, 20_000)
      this.#pending.set(requestId, { resolve, reject, timeout })
      worker.postMessage({ requestId, count: samples.length, buffer: packed.buffer }, [packed.buffer])
    }).catch(() => analyzeSignal(samples))
  }

  dispose() {
    this.#worker?.terminate()
    this.#worker = null
    for (const pending of this.#pending.values()) {
      clearTimeout(pending.timeout)
      pending.reject(new Error('Signal worker was disposed.'))
    }
    this.#pending.clear()
  }

  #getWorker() {
    if (this.#worker) return this.#worker
    this.#worker = new Worker(new URL('../workers/signal.worker.js', import.meta.url), { type: 'module' })
    this.#worker.onmessage = ({ data }) => {
      const pending = this.#pending.get(data.requestId)
      if (!pending) return
      clearTimeout(pending.timeout)
      this.#pending.delete(data.requestId)
      if (data.error) pending.reject(new Error(data.error))
      else pending.resolve(data.result)
    }
    this.#worker.onerror = () => {
      for (const pending of this.#pending.values()) {
        clearTimeout(pending.timeout)
        pending.reject(new Error('Signal worker crashed.'))
      }
      this.#pending.clear()
      this.#worker?.terminate()
      this.#worker = null
    }
    return this.#worker
  }
}

export const signalAnalysisService = new SignalAnalysisService()
