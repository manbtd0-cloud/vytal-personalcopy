const SAMPLE_WIDTH = 4

export function packSamples(samples) {
  const packed = new Float64Array(samples.length * SAMPLE_WIDTH)
  for (let index = 0; index < samples.length; index++) {
    const offset = index * SAMPLE_WIDTH
    const sample = samples[index]
    packed[offset] = Number(sample.t)
    packed[offset + 1] = Number(sample.r)
    packed[offset + 2] = Number(sample.g)
    packed[offset + 3] = Number(sample.b)
  }
  return packed
}

export function unpackSamples(buffer, count) {
  const packed = new Float64Array(buffer)
  const safeCount = Math.min(count, Math.floor(packed.length / SAMPLE_WIDTH))
  const samples = new Array(safeCount)
  for (let index = 0; index < safeCount; index++) {
    const offset = index * SAMPLE_WIDTH
    samples[index] = {
      t: packed[offset],
      r: packed[offset + 1],
      g: packed[offset + 2],
      b: packed[offset + 3],
    }
  }
  return samples
}
