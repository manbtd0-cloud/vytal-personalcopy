/**
 * Longitudinal Patient Risk Scoring
 * References:
 *   - Churpek, M.M. et al. "The value of vital sign trends for detecting clinical deterioration on the wards."
 *     Resuscitation 102:1-5 (2016).
 *   - JMIR 23(2): e25187 (2021) - ML-Based Early Warning Systems systematic review.
 */

/**
 * Generate SVG sparkline path from an array of values.
 * 
 * @param {number[]} values
 * @param {number} width
 * @param {number} height
 * @param {number} pad
 * @returns {string} SVG polyline points string
 */
export function generateSparklinePath(values, width = 120, height = 32, pad = 3) {
  if (!values || values.length < 2) return ''

  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const points = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (width - pad * 2)
    const y = pad + (1 - (v - min) / range) * (height - pad * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })

  return points.join(' ')
}


/**
 * Compute a simple least-squares slope for an array of values.
 * A positive slope means the metric is trending up over visits.
 * 
 * @param {number[]} values
 * @returns {number} slope (change per visit)
 */
function computeSlope(values) {
  if (!values || values.length < 2) return 0

  const n = values.length
  const meanX = (n - 1) / 2
  const meanY = values.reduce((s, v) => s + v, 0) / n

  let num = 0
  let den = 0
  for (let i = 0; i < n; i++) {
    num += (i - meanX) * (values[i] - meanY)
    den += (i - meanX) ** 2
  }

  return den === 0 ? 0 : num / den
}


/**
 * Evaluate longitudinal vitals trend and produce a risk escalation assessment.
 * Requires at least 3 scan records to produce a meaningful trend.
 * 
 * @param {Array<{ hr, br, stress, timestamp }>} scanHistory - Ordered oldest-first
 * @param {{ tier: string }} currentAlertTier - Output of evaluateAlertScale on latest scan
 * @returns {{ trendTier: string|null, trendLabel: string, slopeHr: number, slopeBr: number, sparklineHr: string, sparklineBr: string, message: string }}
 */
export function evaluateLongitudinalRisk(scanHistory, currentAlertTier = { tier: 'GREEN' }) {
  if (!scanHistory || scanHistory.length < 3) {
    return {
      trendTier: null,
      trendLabel: 'Insufficient History',
      slopeHr: 0,
      slopeBr: 0,
      sparklineHr: '',
      sparklineBr: '',
      message: 'At least 3 scan visits needed for longitudinal trend analysis.',
    }
  }

  // Use the most recent 5 visits for trend calculation
  const recent = scanHistory.slice(-5)
  const hrValues = recent.map((s) => s.hr).filter(Boolean)
  const brValues = recent.map((s) => s.br).filter(Boolean)

  const slopeHr = computeSlope(hrValues)
  const slopeBr = computeSlope(brValues)

  // Tier escalation based on worsening trend + already elevated single-scan tier
  const baselineTier = currentAlertTier.tier
  let trendTier = baselineTier

  const hrTrendingUp = slopeHr > 2
  const brTrendingUp = slopeBr > 0.5

  if (hrTrendingUp && brTrendingUp && (baselineTier === 'YELLOW' || baselineTier === 'ORANGE')) {
    if (baselineTier === 'YELLOW') trendTier = 'ORANGE'
    else if (baselineTier === 'ORANGE') trendTier = 'RED'
  } else if (hrTrendingUp && baselineTier === 'YELLOW') {
    trendTier = 'ORANGE'
  }

  let trendLabel = 'Stable Vitals Trend'
  let message = 'Vital sign trends are stable across recent visits.'

  if (hrTrendingUp && brTrendingUp) {
    trendLabel = 'Worsening Multi-Vital Trend'
    message = `Heart rate increasing +${slopeHr.toFixed(1)} bpm/visit and breathing rate +${slopeBr.toFixed(1)} br/visit across recent scans. Consider escalation.`
  } else if (hrTrendingUp) {
    trendLabel = 'Heart Rate Trending Up'
    message = `Heart rate has increased an average of +${slopeHr.toFixed(1)} bpm per visit over the last ${recent.length} scans.`
  } else if (slopeHr < -2) {
    trendLabel = 'Heart Rate Trending Down'
    message = `Heart rate has decreased an average of ${Math.abs(slopeHr).toFixed(1)} bpm per visit — monitor for bradycardia.`
  }

  const sparklineHr = generateSparklinePath(hrValues)
  const sparklineBr = generateSparklinePath(brValues)

  return {
    trendTier,
    trendLabel,
    slopeHr: Math.round(slopeHr * 10) / 10,
    slopeBr: Math.round(slopeBr * 10) / 10,
    sparklineHr,
    sparklineBr,
    message,
  }
}
