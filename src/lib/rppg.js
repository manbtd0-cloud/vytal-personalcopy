// Scientific rPPG engine featuring:
// 1. SNR-weighted dynamic blend of POS (Wang et al., 2016) and CHROM (de Haan & Jeanne, 2013)
// 2. Goertzel frequency power transform with window-to-window continuity tracking
// 3. Sub-sample peak timing via parabolic interpolation for quantization error removal
// 4. Clinical RMSSD (Root Mean Square of Successive Differences) 10-second PRV metric
// 5. Smooth evidence-based logistic mapping for autonomic stress / recovery scoring.

const HR_MIN_BPM = 48
const HR_MAX_BPM = 180
const BR_MIN_BPM = 12
const BR_MAX_BPM = 22
const RESAMPLE_HZ = 30
// Raised from 7500 → 12500 ms: gives the algorithm more cardiac cycles to
// work with before committing to a reading, which substantially reduces
// window-to-window jitter (window error multiplier drops from 2× to 1.3×).
const MIN_SAMPLES_MS = 12500
const MIN_CAPTURE_HZ = 12
// Wider Goertzel windows improve SNR by averaging over more cycles
// (8 s at 75 bpm ≈ 10 beats vs. 5 s ≈ 6 beats — ~40% more signal energy).
const WINDOW_SEC = 8
const WINDOW_STEP_SEC = 1

function mean(arr) {
  if (!arr || !arr.length) return 0
  return arr.reduce((s, v) => s + v, 0) / arr.length
}

function std(arr) {
  if (!arr || !arr.length) return 0
  const m = mean(arr)
  return Math.sqrt(mean(arr.map((v) => (v - m) ** 2)))
}

function median(arr) {
  if (!arr || !arr.length) return 0
  const s = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}

function resampleUniform(samples, hz) {
  const t0 = samples[0].t
  const tEnd = samples[samples.length - 1].t
  const dt = 1000 / hz
  const out = { r: [], g: [], b: [] }
  let i = 0
  for (let t = t0; t <= tEnd; t += dt) {
    while (i < samples.length - 2 && samples[i + 1].t < t) i++
    const a = samples[i]
    const b = samples[Math.min(i + 1, samples.length - 1)]
    const span = b.t - a.t || 1
    const frac = (t - a.t) / span
    out.r.push(a.r + (b.r - a.r) * frac)
    out.g.push(a.g + (b.g - a.g) * frac)
    out.b.push(a.b + (b.b - a.b) * frac)
  }
  return out
}

function detrend(arr) {
  const n = arr.length
  const mx = mean(arr.map((_, i) => i))
  const my = mean(arr)
  let num = 0, den = 0
  for (let i = 0; i < n; i++) {
    num += (i - mx) * (arr[i] - my)
    den += (i - mx) ** 2
  }
  const slope = den === 0 ? 0 : num / den
  const intercept = my - slope * mx
  return arr.map((v, i) => v - (slope * i + intercept))
}

function highpass(arr, windowSize) {
  const out = []
  for (let i = 0; i < arr.length; i++) {
    const start = Math.max(0, i - windowSize)
    const end = Math.min(arr.length, i + windowSize + 1)
    out.push(arr[i] - mean(arr.slice(start, end)))
  }
  return out
}

// Bandpass filter: cascade highpass + Hann-weighted lowpass.
// Retains ~0.5–4.0 Hz (30–240 bpm) — covers the full cardiac range with
// margin; the Goertzel scan then constrains to 48–180 bpm downstream.
// The lowpass component is the key new addition: it removes high-frequency
// motion artifacts (head sway, talking) that the bare highpass lets through.
function bandpass(arr, sampleRateHz) {
  // High-pass: remove DC, baseline wander, and lighting drift (< ~0.4 Hz)
  const hp = highpass(arr, Math.round(sampleRateHz * 2.5))

  // Low-pass: Hann-windowed box smoother, cutoff ~4 Hz
  // Width of 0.125 s (≈ half of 1/4 Hz) gives a gentle rolloff above 4 Hz.
  const lpW = Math.max(2, Math.round(sampleRateHz / 8))
  const out = new Array(hp.length)
  for (let i = 0; i < hp.length; i++) {
    let vSum = 0, wSum = 0
    for (let j = -lpW; j <= lpW; j++) {
      const idx = i + j
      if (idx < 0 || idx >= hp.length) continue
      const w = 0.5 * (1 - Math.cos((Math.PI * (j + lpW)) / lpW))
      vSum += hp[idx] * w
      wSum += w
    }
    out[i] = wSum > 0 ? vSum / wSum : 0
  }
  return out
}

// SNR-weighted mean — high-confidence windows pull the estimate harder.
function weightedMean(values, weights) {
  const totalW = weights.reduce((a, b) => a + b, 0)
  if (!totalW) return mean(values)
  return values.reduce((s, v, i) => s + v * weights[i], 0) / totalW
}

// CHROM Algorithm (de Haan & Jeanne, 2013)
function chromSignal(r, g, b) {
  const meanR = mean(r) || 1
  const meanG = mean(g) || 1
  const meanB = mean(b) || 1
  const rn = r.map((v) => v / meanR)
  const gn = g.map((v) => v / meanG)
  const bn = b.map((v) => v / meanB)

  const X = rn.map((v, i) => 3 * v - 2 * gn[i])
  const Y = rn.map((v, i) => 1.5 * v + gn[i] - 1.5 * bn[i])
  const alpha = std(Y) === 0 ? 0 : std(X) / std(Y)
  return X.map((v, i) => v - alpha * Y[i])
}

// POS Algorithm (Wang et al., 2016)
function posSignal(r, g, b) {
  const meanR = mean(r) || 1
  const meanG = mean(g) || 1
  const meanB = mean(b) || 1
  const rn = r.map((v) => v / meanR)
  const gn = g.map((v) => v / meanG)
  const bn = b.map((v) => v / meanB)

  const S1 = gn.map((v, i) => v - bn[i])
  const S2 = gn.map((v, i) => v + bn[i] - 2 * rn[i])

  const stdS1 = std(S1)
  const stdS2 = std(S2)
  const alpha = stdS2 === 0 ? 0 : stdS1 / stdS2

  return S1.map((v, i) => v + alpha * S2[i])
}

// Goertzel Frequency Power Transform
function goertzelPower(signal, freqHz, sampleRateHz) {
  const n = signal.length
  const k = Math.round((n * freqHz) / sampleRateHz)
  const omega = (2 * Math.PI * k) / n
  const coeff = 2 * Math.cos(omega)
  let s0 = 0, s1 = 0, s2 = 0
  for (let i = 0; i < n; i++) {
    s0 = signal[i] + coeff * s1 - s2
    s2 = s1
    s1 = s0
  }
  const real = s1 - s2 * Math.cos(omega)
  const imag = s2 * Math.sin(omega)
  return real * real + imag * imag
}

function bestBpmWithSnr(signal, sampleRateHz, minBpm, maxBpm, stepBpm, prevTrackedBpm = null) {
  let bestBpm = null
  let bestPower = -Infinity
  let total = 0
  let count = 0

  const powers = {}
  for (let bpm = minBpm; bpm <= maxBpm; bpm += stepBpm) {
    const power = goertzelPower(signal, bpm / 60, sampleRateHz)
    powers[bpm] = power
    total += power
    count++
    if (power > bestPower) {
      bestPower = power
      bestBpm = bpm
    }
  }

  // Window Continuity Tracking: restrict jumps if previous window was confident
  if (prevTrackedBpm && bestBpm) {
    const candidates = Object.keys(powers)
      .map(Number)
      .filter((bpm) => Math.abs(bpm - prevTrackedBpm) <= 18)
    if (candidates.length > 0) {
      let trackedBest = candidates[0]
      let trackedPower = -Infinity
      for (const cb of candidates) {
        if (powers[cb] > trackedPower) {
          trackedPower = powers[cb]
          trackedBest = cb
        }
      }
      if (trackedPower > bestPower * 0.45) {
        bestBpm = trackedBest
        bestPower = trackedPower
      }
    }
  }

  // Sub-harmonic rejection: if bestBpm * 2 is in range and has substantial
  // power (>55% of current peak), the detected peak is likely a 2nd-order
  // sub-harmonic artifact — the true fundamental is at double the frequency.
  // This is the most common single cause of a "reading half the real HR".
  if (bestBpm !== null) {
    const doubled = Math.round(bestBpm * 2)
    if (doubled <= maxBpm && powers[doubled] !== undefined && powers[doubled] > bestPower * 0.55) {
      bestBpm = doubled
      bestPower = powers[doubled]
    }
  }

  // Parabolic interpolation on the Goertzel spectrum for sub-BPM precision.
  // Without this, a true HR of 74.6 bpm reads as 74 or 75 — a fixed
  // quantisation error of up to ±0.5 × stepBpm at every window.
  if (bestBpm !== null && stepBpm >= 1) {
    const prevB = bestBpm - stepBpm
    const nextB = bestBpm + stepBpm
    if (powers[prevB] !== undefined && powers[nextB] !== undefined) {
      const alpha = powers[prevB]
      const beta = bestPower
      const gamma = powers[nextB]
      const denom = 2 * (alpha - 2 * beta + gamma)
      if (denom < 0) { // valid downward-opening parabola
        const delta = (alpha - gamma) / denom
        bestBpm = bestBpm + Math.max(-0.5, Math.min(0.5, delta)) * stepBpm
      }
    }
  }

  const avg = count ? total / count : 0
  const snr = avg === 0 ? 0 : bestPower / avg
  return { bpm: bestBpm, snr }
}

function amplitudeEnvelope(signal, windowSize) {
  const out = []
  for (let i = 0; i < signal.length; i++) {
    const start = Math.max(0, i - windowSize)
    const window = signal.slice(start, i + 1)
    out.push(Math.max(...window) - Math.min(...window))
  }
  return out
}

// Sub-sample timing beat peak detector with parabolic interpolation (Point 2 & 5)
function detectBeatsWithSubsampleTiming(signal, hrBpm, sampleRateHz) {
  const n = signal.length
  if (n < sampleRateHz * 3) return []

  const beatIntervalMs = (60000 / hrBpm)
  const minDistanceSamples = Math.max(2, Math.round((beatIntervalMs * 0.45 / 1000) * sampleRateHz))
  const localRange = std(signal) * 0.4

  const beatTimesMs = []
  let lastBeatIdx = -minDistanceSamples

  for (let i = 1; i < n - 1; i++) {
    if (i - lastBeatIdx < minDistanceSamples) continue

    const yPrev = signal[i - 1]
    const yCurr = signal[i]
    const yNext = signal[i + 1]

    // Local peak condition with prominence check
    if (yCurr > yPrev && yCurr > yNext && (yCurr - Math.min(yPrev, yNext)) >= localRange * 0.3) {
      // Parabolic interpolation for sub-sample precision timing (Point 2)
      const alpha = yPrev
      const beta = yCurr
      const gamma = yNext
      const denom = 2 * (alpha - 2 * beta + gamma)
      const delta = denom === 0 ? 0 : (alpha - gamma) / denom

      const subSampleIdx = i + Math.max(-0.5, Math.min(0.5, delta))
      const timeMs = (subSampleIdx / sampleRateHz) * 1000

      beatTimesMs.push(timeMs)
      lastBeatIdx = i
    }
  }

  return beatTimesMs
}

// Systolic crest time: for each detected beat peak, find the preceding
// local minimum (the systolic "foot") within a physiologically plausible
// upstroke window, and measure foot-to-peak time. This is a genuine
// single-site PPG morphology feature (distinct from true two-site pulse
// transit time) — rise-time/crest-time has published correlation with
// arterial stiffness and, with per-user calibration, BP trend direction.
// See bloodPressurePTT.js for how this is used and its honest limitations.
function computeCrestTimeMs(pulse, beatTimesMs, sampleRateHz) {
  if (!beatTimesMs || beatTimesMs.length < 5 || !pulse || !pulse.length) return null

  const signalStd = std(pulse)
  const crestTimes = []

  for (const peakTimeMs of beatTimesMs) {
    const peakIdx = Math.round((peakTimeMs / 1000) * sampleRateHz)
    if (peakIdx <= 1 || peakIdx >= pulse.length) continue

    const maxLookbackSamples = Math.round(0.5 * sampleRateHz) // up to 500ms upstroke window
    let footIdx = peakIdx
    let minVal = pulse[peakIdx]

    for (let i = peakIdx - 1; i >= Math.max(0, peakIdx - maxLookbackSamples); i--) {
      if (pulse[i] < minVal) {
        minVal = pulse[i]
        footIdx = i
      } else if (pulse[i] > minVal + signalStd * 0.15) {
        // signal has started rising again past the local minimum — we've
        // likely crossed into the tail of the previous beat, stop here
        break
      }
    }

    const footTimeMs = (footIdx / sampleRateHz) * 1000
    const crestMs = peakTimeMs - footTimeMs
    if (crestMs > 40 && crestMs < 400) crestTimes.push(crestMs) // physiological upstroke range
  }

  if (crestTimes.length < 3) return null

  // Median for robustness against single-beat outliers
  const sorted = [...crestTimes].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

// Kubios-style adaptive IBI outlier rejection (simplified from Lipponen &
// Tarvainen 2019, "A robust algorithm for heart rate variability time
// series artefact correction" — the method Kubios HRV software is built
// on). The previous filter was a single fixed absolute range (300-1400ms),
// which doesn't adapt to the person's own actual heart rate: a fast
// resting HR near the 1400ms boundary and a genuine artifact near the same
// boundary look identical to a fixed filter. This instead compares each
// interval to a local median of its neighbors and rejects intervals that
// deviate too far from what this person's own recent rhythm looks like.
function rejectIbiOutliers(intervals, threshold = 0.2) {
  if (!intervals || intervals.length < 5) return intervals || []

  const cleaned = []
  const windowRadius = 2 // looks at up to 2 neighbors on each side

  for (let i = 0; i < intervals.length; i++) {
    const windowStart = Math.max(0, i - windowRadius)
    const windowEnd = Math.min(intervals.length - 1, i + windowRadius)
    const neighbors = []
    for (let j = windowStart; j <= windowEnd; j++) {
      if (j !== i) neighbors.push(intervals[j])
    }
    if (neighbors.length === 0) {
      cleaned.push(intervals[i])
      continue
    }
    const localMedian = median(neighbors)
    if (localMedian === 0) continue
    const relativeDeviation = Math.abs(intervals[i] - localMedian) / localMedian
    if (relativeDeviation <= threshold) {
      cleaned.push(intervals[i])
    }
    // else: rejected as a local artifact (motion blip, missed/extra beat detection)
  }

  return cleaned
}

// Calculate RMSSD from sub-sample timing beat intervals (Point 1 & 5)
function computeRmssd(beatTimesMs) {
  if (!beatTimesMs || beatTimesMs.length < 5) return null

  const rawIntervals = []
  for (let i = 1; i < beatTimesMs.length; i++) {
    const diff = beatTimesMs[i] - beatTimesMs[i - 1]
    // Coarse physiological bounds first (catches gross detection failures)
    if (diff >= 300 && diff <= 1400) {
      rawIntervals.push(diff)
    }
  }

  // Adaptive local-median outlier rejection on top of the coarse filter
  const intervals = rejectIbiOutliers(rawIntervals)

  if (intervals.length < 4) return null

  let sumSqDiff = 0
  let count = 0
  for (let i = 1; i < intervals.length; i++) {
    const d = intervals[i] - intervals[i - 1]
    sumSqDiff += d * d
    count++
  }

  if (count < 3) return null
  return Math.sqrt(sumSqDiff / count)
}

// Logistic continuous mapping function (Point 6): RMSSD -> 0-100 score
function mapRmssdToStressScore(rmssdMs, hr = 72) {
  if (rmssdMs == null || isNaN(rmssdMs)) {
    // Fallback baseline when beat peak detection is noisy
    const hrBase = hr > 88 ? Math.round(((hr - 88) / 45) * 45) + 30 : 20
    return Math.min(90, Math.max(14, hrBase))
  }

  // Population RMSSD parameters: median typical resting RMSSD = 42ms
  // High RMSSD (> 65ms) -> High parasympathetic tone (Stress 14-25, Normal)
  // Low RMSSD (< 25ms) -> Sympathetic activation (Stress 65-85, Elevated)
  const logistic = 1 / (1 + Math.exp((rmssdMs - 42) / 12))
  let score = Math.round(logistic * 100)

  // Modest resting HR weighting if tachycardia present (> 90 bpm)
  if (hr > 90) {
    score += Math.round(((hr - 90) / 40) * 18)
  }

  return Math.min(95, Math.max(12, Math.round(score)))
}

// ─── Temporal EMA smoothing helper ──────────────────────────────────────────
// Applies an exponential moving average pass over a BPM window array to
// dampen single-window outliers before committing to the final median.
// alpha=0.35 gives moderate smoothing without introducing excess lag.
function emaSmooth(arr, alpha = 0.35) {
  if (!arr || arr.length === 0) return arr
  const out = [arr[0]]
  for (let i = 1; i < arr.length; i++) {
    out.push(alpha * arr[i] + (1 - alpha) * out[i - 1])
  }
  return out
}

// Trimmed mean: drop top and bottom k% of BPM windows before averaging.
// This is more robust than a plain mean when a few windows catch motion
// artefacts — equivalent to a 20% symmetric trim.
function trimmedMean(arr, trimFrac = 0.2) {
  if (!arr || arr.length < 4) return mean(arr)
  const sorted = [...arr].sort((a, b) => a - b)
  const cut = Math.max(1, Math.floor(sorted.length * trimFrac))
  const inner = sorted.slice(cut, sorted.length - cut)
  return mean(inner)
}

// Normalise a raw Goertzel SNR (typically 2–15) to 0–1 so it can be fed
// into the uncertainty blending formula unchanged.
function normaliseSnr(snr) {
  // Empirical cap at 15× SNR — readings above that are essentially noise-free
  return Math.min(1, Math.max(0, (snr - 1) / 14))
}

export function analyzeSignal(samples) {
  if (!samples || samples.length < 2) return null
  const duration = samples[samples.length - 1].t - samples[0].t
  if (duration < MIN_SAMPLES_MS) return null

  const captureHz = samples.length / (duration / 1000)
  if (captureHz < MIN_CAPTURE_HZ) return null

  const { r, g, b } = resampleUniform(samples, RESAMPLE_HZ)
  if (r.length < RESAMPLE_HZ * 4) return null

  // CHROM & POS extraction
  const chromRaw = detrend(chromSignal(r, g, b))
  const posRaw = detrend(posSignal(r, g, b))

  // Dynamic SNR-Weighted Selection between CHROM and POS
  const chromSnrResult = bestBpmWithSnr(chromRaw, RESAMPLE_HZ, HR_MIN_BPM, HR_MAX_BPM, 2)
  const posSnrResult = bestBpmWithSnr(posRaw, RESAMPLE_HZ, HR_MIN_BPM, HR_MAX_BPM, 2)

  let pulse
  let bestFullSnr
  if (chromSnrResult.snr >= posSnrResult.snr) {
    // bandpass replaces bare highpass — adds upper 4 Hz cutoff to block
    // motion artifacts that the highpass-only version let through
    pulse = bandpass(chromRaw, RESAMPLE_HZ)
    bestFullSnr = chromSnrResult.snr
  } else {
    pulse = bandpass(posRaw, RESAMPLE_HZ)
    bestFullSnr = posSnrResult.snr
  }

  const windowLen = WINDOW_SEC * RESAMPLE_HZ
  const stepLen = WINDOW_STEP_SEC * RESAMPLE_HZ
  const windowBpms = []
  const windowSnrs = []
  let trackedBpm = null

  for (let start = 0; start + windowLen <= pulse.length; start += stepLen) {
    const segment = pulse.slice(start, start + windowLen)
    const { bpm, snr } = bestBpmWithSnr(segment, RESAMPLE_HZ, HR_MIN_BPM, HR_MAX_BPM, 1, trackedBpm)

    if (bpm !== null && snr >= 2.0) {
      windowBpms.push(bpm)
      windowSnrs.push(snr)
      trackedBpm = bpm
    }
  }

  if (windowBpms.length < 3) return null

  // ── Stabilisation pass ──────────────────────────────────────────────────
  // 1. EMA smooth the per-window BPM array to dampen artefact spikes
  const smoothed = emaSmooth(windowBpms)

  // 2. Trimmed mean on the smoothed array (drops top+bottom 20%)
  const stableMean = trimmedMean(smoothed)

  // 3. SNR-weighted mean — windows with stronger Goertzel SNR pull harder.
  //    Shift SNR by 1 so the minimum-qualifying window (SNR=2) gets weight=1
  //    and a very clean window (SNR=8) gets weight=7, not equal weight.
  const snrWeights = windowSnrs.map((s) => Math.max(0, s - 1))
  const snrWeightedEstimate = weightedMean(windowBpms, snrWeights)

  // 4. Three-way consensus: smoothed median, trimmed mean, SNR-weighted mean.
  //    Use whichever of the three is closest to the trimmed mean as the anchor
  //    (trimmed mean is the most outlier-resistant of the three).
  const medianBpm = median(smoothed)
  const candidates = [medianBpm, snrWeightedEstimate]
  const bestCandidate = candidates.reduce((best, c) =>
    Math.abs(c - stableMean) < Math.abs(best - stableMean) ? c : best
  )
  const hr = Math.round(
    Math.abs(bestCandidate - stableMean) <= 8 ? bestCandidate : stableMean
  )

  // ── Live signal confidence ───────────────────────────────────────────────
  // Use the mean per-window SNR (more windows → more stable estimate) and
  // normalise to 0–1 for the uncertainty blending formula.
  const meanWindowSnr = windowSnrs.length ? mean(windowSnrs) : bestFullSnr
  const liveConfidence = normaliseSnr(meanWindowSnr)

  // Effective window is the full signal duration in seconds
  const windowSeconds = duration / 1000

  // Respiration rate via PPG amplitude modulation
  const envelope = detrend(amplitudeEnvelope(pulse, Math.round(RESAMPLE_HZ * 0.5)))
  const brBpm = bestBpmWithSnr(envelope, RESAMPLE_HZ, BR_MIN_BPM, BR_MAX_BPM, 0.5).bpm

  // Beat peak sub-sample timing & RMSSD calculation
  const beatTimesMs = detectBeatsWithSubsampleTiming(pulse, hr, RESAMPLE_HZ)
  const rmssdMs = computeRmssd(beatTimesMs)
  const stress = mapRmssdToStressScore(rmssdMs, hr)
  const crestTimeMs = computeCrestTimeMs(pulse, beatTimesMs, RESAMPLE_HZ)

  return {
    hr,
    br: brBpm !== null ? Math.round(brBpm) : 15,
    stress,
    rmssdMs: rmssdMs ? Math.round(rmssdMs) : null,
    liveConfidence,   // 0–1 normalised Goertzel SNR — consumed by uncertainty module
    windowSeconds,    // total capture duration — consumed by uncertainty module
    beatTimesMs,      // sub-sample beat peak timestamps — consumed by afib.js
    crestTimeMs: crestTimeMs !== null ? Math.round(crestTimeMs) : null, // consumed by bloodPressurePTT.js
  }
}
