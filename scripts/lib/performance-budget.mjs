export function percentile(values, ratio) {
  if (!values.length) return 0
  if (!Number.isFinite(ratio) || ratio < 0 || ratio > 1) {
    throw new RangeError('Percentile ratio must be between 0 and 1.')
  }
  const sorted = [...values].sort((left, right) => left - right)
  const index = Math.max(0, Math.min(sorted.length - 1, Math.ceil(ratio * sorted.length) - 1))
  return sorted[index]
}

export function summarizeLoad(results, elapsedMs, budget) {
  if (!Array.isArray(results) || !results.length) throw new Error('Load test produced no results.')
  const latencies = results.map(({ latencyMs }) => latencyMs)
  const failed = results.filter(({ ok }) => !ok).length
  const errorRate = failed / results.length
  const summary = {
    requests: results.length,
    successful: results.length - failed,
    failed,
    errorRate: Number(errorRate.toFixed(4)),
    throughputPerSecond: Number((results.length / Math.max(elapsedMs / 1000, 0.001)).toFixed(2)),
    latencyMs: {
      min: Number(Math.min(...latencies).toFixed(2)),
      p50: Number(percentile(latencies, 0.5).toFixed(2)),
      p95: Number(percentile(latencies, 0.95).toFixed(2)),
      p99: Number(percentile(latencies, 0.99).toFixed(2)),
      max: Number(Math.max(...latencies).toFixed(2)),
    },
    statusCounts: Object.fromEntries(
      [...results.reduce((counts, result) => {
        const key = result.status ? String(result.status) : 'network_error'
        counts.set(key, (counts.get(key) ?? 0) + 1)
        return counts
      }, new Map())].sort(([left], [right]) => left.localeCompare(right)),
    ),
  }
  const violations = []
  if (summary.latencyMs.p95 > budget.p95Ms) violations.push(`p95 exceeded ${budget.p95Ms} ms`)
  if (summary.latencyMs.p99 > budget.p99Ms) violations.push(`p99 exceeded ${budget.p99Ms} ms`)
  if (summary.errorRate > budget.maxErrorRate) violations.push(`error rate exceeded ${budget.maxErrorRate}`)
  return { ...summary, budget, withinBudget: violations.length === 0, violations }
}
