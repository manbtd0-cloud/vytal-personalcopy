import test from 'node:test'
import assert from 'node:assert/strict'

test('clinical observations serialize only measured finite values with stable keys', async () => {
  const { toClinicalObservations } = await import('../../src/domain/clinical/clinicalObservations.js')
  const observations = toClinicalObservations({
    hr: 78,
    br: 16,
    stress: 31,
    spo2: 97,
    anemiaResult: { hb: 8.4, erythemaIndex: 4.59, tier: 'ORANGE' },
    jaundiceResult: { yellowIndex: Number.NaN, tier: 'UNKNOWN' },
  })
  assert.deepEqual(observations.map(({ metric_key, value_numeric, value_text, unit }) => ({ metric_key, value_numeric, value_text, unit })), [
    { metric_key: 'heart_rate', value_numeric: 78, value_text: null, unit: 'bpm' },
    { metric_key: 'breathing_rate', value_numeric: 16, value_text: null, unit: 'breaths/min' },
    { metric_key: 'stress_score', value_numeric: 31, value_text: null, unit: 'score/100' },
    { metric_key: 'spo2_proxy', value_numeric: 97, value_text: null, unit: '%' },
    { metric_key: 'hemoglobin_proxy', value_numeric: 8.4, value_text: null, unit: 'g/dL' },
    { metric_key: 'anemia_erythema_index', value_numeric: 4.59, value_text: null, unit: 'index' },
    { metric_key: 'anemia_tier', value_numeric: null, value_text: 'ORANGE', unit: null },
    { metric_key: 'jaundice_tier', value_numeric: null, value_text: 'UNKNOWN', unit: null },
  ])
})

test('visual screening observations never fabricate heart rate', async () => {
  const { toClinicalObservations } = await import('../../src/domain/clinical/clinicalObservations.js')
  const observations = toClinicalObservations({ mode: 'jaundice', jaundiceResult: { yellowIndex: 28, tier: 'ORANGE' } })
  assert.deepEqual(observations.map((item) => item.metric_key), ['bilirubin_proxy', 'jaundice_tier'])
  assert.equal(observations.some((item) => item.metric_key === 'heart_rate'), false)
})
