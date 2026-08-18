/**
 * Population-Level Anomaly & Disease Outbreak Detection
 * Reference: CDC Statistical Process Control (SPC) Shewhart charts / EARS
 * (Early Aberration Reporting System) EWMA-style surveillance methods for
 * epidemiological aberration detection.
 *
 * Replaces the previous fixed-15%-baseline stub with an actual moving
 * baseline computed from the app's own historical daily flag rates, using
 * an EWMA (exponentially weighted moving average) — a standard, widely
 * used method in syndromic surveillance (CDC EARS C1-MILD family) that
 * doesn't require a rigid fixed-length history window and adapts as more
 * data accumulates, which matters for a low-volume community screening
 * deployment where a strict "last 7 days" requirement would rarely have
 * enough data to ever fire.
 */

/**
 * Analyze regional scan logs for statistically significant anomaly spikes (outbreak detection).
 * 
 * @param {Array<{ timestamp: string, alertTier: string, status: string }>} allRecords
 * @returns {{ isAnomaly: boolean, baselineFlagRate: number, currentFlagRate: number, zScore: number, alertMessage: string, method: string }}
 */
export function evaluatePopulationAnomaly(allRecords) {
  if (!allRecords || allRecords.length < 5) {
    return {
      isAnomaly: false,
      baselineFlagRate: null,
      currentFlagRate: null,
      zScore: 0,
      alertMessage: 'Insufficient aggregate sample for a surveillance baseline (need at least 5 records).',
      method: 'insufficient-data',
    }
  }

  const isFlagged = (r) => r.status === 'flagged' || r.alertTier === 'RED' || r.alertTier === 'ORANGE'

  // Bucket records into calendar days (from ISO timestamp date portion)
  const byDay = new Map()
  for (const r of allRecords) {
    const day = (r.timestamp || '').slice(0, 10)
    if (!day) continue
    if (!byDay.has(day)) byDay.set(day, { total: 0, flagged: 0 })
    const bucket = byDay.get(day)
    bucket.total++
    if (isFlagged(r)) bucket.flagged++
  }

  const days = Array.from(byDay.keys()).sort()

  if (days.length < 2) {
    // Not enough distinct days yet to build a real moving baseline — fall
    // back to a single-sample proportion check against a literature-
    // informed community-triage prior (~15%), clearly labeled as
    // provisional rather than presented as an established baseline.
    const total = allRecords.length
    const flagged = allRecords.filter(isFlagged).length
    const currentFlagRate = flagged / total
    const priorRate = 0.15
    const stdDev = Math.sqrt((priorRate * (1 - priorRate)) / total) || 0.05
    const zScore = (currentFlagRate - priorRate) / stdDev
    const isAnomaly = zScore >= 3.0

    return {
      isAnomaly,
      baselineFlagRate: Math.round(priorRate * 100),
      currentFlagRate: Math.round(currentFlagRate * 100),
      zScore: Math.round(zScore * 100) / 100,
      alertMessage: isAnomaly
        ? `Flagged triage rate (${Math.round(currentFlagRate * 100)}%) is well above the general community-triage prior — but this is a single-day estimate, not a real moving baseline yet (need 2+ days of data). Treat as provisional.`
        : 'Population triage flag rate is within normal limits (provisional single-day estimate — the baseline strengthens as more days of data accumulate).',
      method: 'single-day-prior-fallback',
    }
  }

  // EWMA moving baseline over daily flag rates. lambda=0.3 is a standard
  // smoothing constant for EWMA aberration-detection charts (CDC EARS-style
  // methods commonly use lambda in the 0.2-0.3 range).
  const lambda = 0.3
  const dailyRates = days.map((d) => {
    const b = byDay.get(d)
    return b.total > 0 ? b.flagged / b.total : 0
  })

  let ewma = dailyRates[0]
  const ewmaSeries = [ewma]
  for (let i = 1; i < dailyRates.length; i++) {
    ewma = lambda * dailyRates[i] + (1 - lambda) * ewma
    ewmaSeries.push(ewma)
  }

  // Today's baseline is the EWMA computed through yesterday (excludes
  // today's own value from its own baseline, or the anomaly would dilute
  // itself into the average it's being compared against).
  const baselineFlagRate = ewmaSeries[ewmaSeries.length - 2]
  const currentFlagRate = dailyRates[dailyRates.length - 1]
  const todayTotal = byDay.get(days[days.length - 1]).total

  // Binomial-proportion process variance at today's sample size
  const stdDev = Math.sqrt((baselineFlagRate * (1 - baselineFlagRate)) / Math.max(todayTotal, 1)) || 0.05
  // EWMA statistic's own variance factor (standard EWMA control-chart formula)
  const ewmaVarianceFactor = Math.sqrt((lambda / (2 - lambda)) * (1 - Math.pow(1 - lambda, 2 * (days.length - 1))))
  const controlLimitWidth = 2.7 // standard EWMA chart L value (~3-sigma equivalent)

  const denom = stdDev * ewmaVarianceFactor
  const zScore = denom > 0 ? (currentFlagRate - baselineFlagRate) / denom : 0
  const isAnomaly = zScore >= controlLimitWidth

  return {
    isAnomaly,
    baselineFlagRate: Math.round(baselineFlagRate * 100),
    currentFlagRate: Math.round(currentFlagRate * 100),
    zScore: Math.round(zScore * 100) / 100,
    daysOfData: days.length,
    alertMessage: isAnomaly
      ? `🚨 REGIONAL OUTBREAK ANOMALY DETECTED: Today's flagged triage rate (${Math.round(currentFlagRate * 100)}%) is a significant deviation from the ${days.length}-day EWMA moving baseline (${Math.round(baselineFlagRate * 100)}%). Notify public health surveillance team.`
      : `Population triage flag rate is within normal limits relative to the ${days.length}-day EWMA moving baseline (${Math.round(baselineFlagRate * 100)}%).`,
    method: 'ewma-moving-baseline',
  }
}
