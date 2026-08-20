/**
 * Irregular Heartbeat Flag (AFib Proxy Module)
 * Reference: Vandecasteele, K. et al. (JMIR mHealth 2018) / FibriCheck validation
 * Analyzes beatTimesMs inter-beat intervals for aperiodic rhythm patterns.
 *
 * Extended with a Poincaré SD1/SD2 geometry check and a sample-entropy
 * irregularity screen, combined with the original RMSSD/pNN50 check as a
 * 3-signal evidence vote rather than a single hard AND-threshold — no one
 * signal is reliable enough alone on a short (~10-20 beat), noisy rPPG-
 * derived RR series to be a sole gate.
 */

// Poincaré plot geometry: SD1 = short-term (beat-to-beat) variability,
// perpendicular to the line of identity; SD2 = long-term variability,
// along the line of identity. A low SD1/SD2 ratio (elongated ellipse)
// is consistent with normal sinus rhythm; a ratio approaching 1 (a more
// circular/chaotic plot) is a classic AFib Poincaré signature.
function computeSD1SD2(rrIntervals) {
  const n = rrIntervals.length
  if (n < 3) return { sd1: null, sd2: null, ratio: null }

  const diffs = []
  for (let i = 0; i < n - 1; i++) diffs.push(rrIntervals[i + 1] - rrIntervals[i])

  const mean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length
  const variance = (arr) => {
    const m = mean(arr)
    return arr.reduce((sum, v) => sum + (v - m) ** 2, 0) / arr.length
  }

  const diffVar = variance(diffs)
  const rrVar = variance(rrIntervals)

  const sd1 = Math.sqrt(diffVar / 2)
  const sd2Sq = 2 * rrVar - diffVar / 2
  const sd2 = sd2Sq > 0 ? Math.sqrt(sd2Sq) : 0

  return {
    sd1,
    sd2,
    ratio: sd2 > 0 ? sd1 / sd2 : null,
  }
}

// Sample entropy (SampEn, m=2): measures how unpredictable/irregular a
// time series is — higher values mean the sequence is less self-similar
// (more random), which is the expected signature of an irregular rhythm
// vs. the smooth quasi-periodic RR pattern of normal sinus rhythm.
// Note: with the short RR series available here (~10-25 beats from a
// single scan), this is a coarse, high-variance estimate — treated as
// one vote among three, not a standalone diagnostic threshold.
function computeSampleEntropy(rrIntervals, m = 2, rFactor = 0.2) {
  const n = rrIntervals.length
  if (n < m + 2) return null

  const std = (() => {
    const mean = rrIntervals.reduce((a, b) => a + b, 0) / n
    const variance = rrIntervals.reduce((s, v) => s + (v - mean) ** 2, 0) / n
    return Math.sqrt(variance)
  })()
  const r = rFactor * std
  if (r === 0) return 0 // perfectly constant series -> zero entropy

  const countMatches = (dim) => {
    let matches = 0
    for (let i = 0; i < n - dim; i++) {
      for (let j = i + 1; j < n - dim; j++) {
        let maxDist = 0
        for (let k = 0; k < dim; k++) {
          maxDist = Math.max(maxDist, Math.abs(rrIntervals[i + k] - rrIntervals[j + k]))
        }
        if (maxDist <= r) matches++
      }
    }
    return matches
  }

  const B = countMatches(m)
  const A = countMatches(m + 1)

  if (B === 0 || A === 0) return null // not enough repeated patterns to estimate

  return -Math.log(A / B)
}

/**
 * Check beat-to-beat timing intervals for AFib-like irregular rhythm signatures.
 *
 * @param {number[]} beatTimesMs - Array of beat peak timestamps in milliseconds
 * @param {string} mode - Capture mode ('face' or 'fingertip')
 * @returns {{ isIrregular: boolean, label: string, rmssd: number|null, pnn50: number|null, message: string }}
 */
export function checkIrregularRhythm(beatTimesMs, mode = 'face') {
  if (!beatTimesMs || beatTimesMs.length < 9) {
    return {
      isIrregular: false,
      label: 'Regular Rhythm',
      rmssd: null,
      pnn50: null,
      message: 'Insufficient beat data to assess rhythm regularity.',
    }
  }

  // 1. Compute RR intervals and filter physiological outliers
  const rrIntervals = []
  for (let i = 1; i < beatTimesMs.length; i++) {
    const diff = beatTimesMs[i] - beatTimesMs[i - 1]
    if (diff >= 300 && diff <= 2000) {
      rrIntervals.push(diff)
    }
  }

  if (rrIntervals.length < 8) {
    return {
      isIrregular: false,
      label: 'Regular Rhythm',
      rmssd: null,
      pnn50: null,
      message: 'Insufficient valid RR intervals.',
    }
  }

  // 2. Compute RMSSD and pNN50
  let diffSqSum = 0
  let nn50Count = 0
  const pairCount = rrIntervals.length - 1

  for (let i = 0; i < pairCount; i++) {
    const d = Math.abs(rrIntervals[i + 1] - rrIntervals[i])
    diffSqSum += d * d
    if (d > 50) {
      nn50Count++
    }
  }

  const rmssd = Math.sqrt(diffSqSum / pairCount)
  const pnn50 = nn50Count / pairCount

  // 3. Poincaré SD1/SD2 geometry
  const { sd1, sd2, ratio: sd1sd2Ratio } = computeSD1SD2(rrIntervals)

  // 4. Sample entropy
  const sampleEntropy = computeSampleEntropy(rrIntervals)

  // 5. Three-signal evidence vote (higher confidence required for face mode,
  // which has a noisier signal path than direct fingertip contact PPG).
  // Each signal votes independently; isIrregular requires at least 2 of 3
  // to fire, rather than a single brittle AND across two correlated metrics.
  const rmssdCutoff = mode === 'face' ? 115 : 100
  const pnn50Cutoff = mode === 'face' ? 0.35 : 0.30
  const sd1sd2Cutoff = 0.6 // literature-informed but not clinically validated for this signal path
  const sampleEntropyCutoff = mode === 'face' ? 1.4 : 1.2

  let votes = 0
  if (rmssd > rmssdCutoff && pnn50 > pnn50Cutoff) votes++
  if (sd1sd2Ratio !== null && sd1sd2Ratio > sd1sd2Cutoff) votes++
  if (sampleEntropy !== null && sampleEntropy > sampleEntropyCutoff) votes++

  const isIrregular = votes >= 2

  return {
    isIrregular,
    label: isIrregular ? 'Irregular Rhythm (AFib Proxy)' : 'Regular Sinus Rhythm',
    rmssd: Math.round(rmssd),
    pnn50: Math.round(pnn50 * 100) / 100,
    sd1: sd1 !== null ? Math.round(sd1) : null,
    sd2: sd2 !== null ? Math.round(sd2) : null,
    sd1sd2Ratio: sd1sd2Ratio !== null ? Math.round(sd1sd2Ratio * 100) / 100 : null,
    sampleEntropy: sampleEntropy !== null ? Math.round(sampleEntropy * 100) / 100 : null,
    message: isIrregular
      ? 'Possible irregular rhythm detected (elevated beat-to-beat variability across multiple measures) — refer for clinical 12-lead ECG evaluation.'
      : 'Beat intervals are periodic and consistent with normal sinus rhythm.',
  }
}
