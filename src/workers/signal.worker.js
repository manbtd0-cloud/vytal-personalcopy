import { analyzeSignal } from '../lib/rppg.js'
import { unpackSamples } from '../lib/sampleTransport.js'

self.onmessage = ({ data }) => {
  const { requestId, buffer, count } = data
  try {
    const result = analyzeSignal(unpackSamples(buffer, count))
    self.postMessage({ requestId, result })
  } catch (error) {
    self.postMessage({
      requestId,
      error: error instanceof Error ? error.message : 'Signal analysis failed.',
    })
  }
}
