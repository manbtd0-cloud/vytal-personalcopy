import test from 'node:test'
import assert from 'node:assert/strict'
import { clinicalRiskPolicy } from '../../src/domain/clinical/ClinicalRiskPolicy.js'

function canvasContext({ fullFrame = [128, 128, 128], roi = [128, 128, 128], pixels = 500 } = {}) {
  const rgba = ([r, g, b], count) => {
    const data = new Uint8ClampedArray(count * 4)
    for (let index = 0; index < data.length; index += 4) {
      data[index] = r
      data[index + 1] = g
      data[index + 2] = b
      data[index + 3] = 255
    }
    return data
  }
  return {
    canvas: { width: 2, height: 2 },
    getImageData: (x, y, width, height) => ({
      data: width === 2 && height === 2 ? rgba(fullFrame, 4) : rgba(roi, pixels),
    }),
  }
}

test('extended policy uses age-aware tiers and visual screening results', () => {
  const child = clinicalRiskPolicy.evaluate({ heartRate: 138, breathingRate: 24, stressScore: 20, ageGroup: 'child_5_12' })
  assert.equal(child.tier, 'ORANGE')
  assert.equal(child.flagged, true)

  const anemia = clinicalRiskPolicy.evaluate({ mode: 'anemia', anemia: { tier: 'ORANGE', hb: 8.2 } })
  assert.equal(anemia.tier, 'ORANGE')
  assert.equal(anemia.flagged, true)
  assert.equal(anemia.priority, 'priority')
  assert.match(anemia.reasons.join(' '), /anemia/i)

  const retry = clinicalRiskPolicy.evaluate({ mode: 'anemia', anemia: { tier: 'UNKNOWN', hb: null } })
  assert.equal(retry.tier, 'UNKNOWN')
  assert.equal(retry.flagged, false)
})

test('extended policy includes oxygen and rhythm confirmation thresholds', () => {
  const oxygen = clinicalRiskPolicy.evaluate({
    heartRate: 78,
    breathingRate: 16,
    stressScore: 20,
    spo2: 89,
  })
  assert.equal(oxygen.flagged, true)
  assert.equal(oxygen.tier, 'RED')
  assert.match(oxygen.reasons.join(' '), /SpO₂/i)

  const rhythm = clinicalRiskPolicy.evaluate({
    heartRate: 78,
    breathingRate: 16,
    stressScore: 20,
    isIrregularRhythm: true,
  })
  assert.equal(rhythm.flagged, true)
  assert.equal(rhythm.priority, 'urgent')
  assert.match(rhythm.reasons.join(' '), /rhythm/i)
})

test('anemia proxy distinguishes failed capture, severe pallor, and well-perfused tissue', async () => {
  const { analyzeConjunctivalPallor } = await import('../../src/lib/anemia.js')
  assert.equal(analyzeConjunctivalPallor(null, null).tier, 'UNKNOWN')
  assert.equal(analyzeConjunctivalPallor(canvasContext({ roi: [120, 118, 80] }), { x: 0, y: 0, w: 25, h: 20 }).tier, 'RED')
  assert.equal(analyzeConjunctivalPallor(canvasContext({ roi: [180, 110, 100] }), { x: 0, y: 0, w: 25, h: 20 }).tier, 'GREEN')
})

test('jaundice proxy distinguishes failed capture and ambient-corrected scleral yellowing', async () => {
  const { analyzeScleralIcterus } = await import('../../src/lib/jaundice.js')
  assert.equal(analyzeScleralIcterus(null, null).tier, 'UNKNOWN')
  const positive = analyzeScleralIcterus(canvasContext({ roi: [210, 185, 75] }), { x: 0, y: 0, w: 25, h: 20 })
  assert.equal(positive.tier, 'ORANGE')
  assert.equal(positive.isJaundiced, true)
  const normal = analyzeScleralIcterus(canvasContext({ roi: [205, 202, 198] }), { x: 0, y: 0, w: 25, h: 20 })
  assert.equal(normal.tier, 'GREEN')
  assert.equal(normal.isJaundiced, false)
})

test('blood-pressure trend never fabricates an uncalibrated cuff reading', async () => {
  const { estimateBloodPressurePTT, saveBpCalibration } = await import('../../src/lib/bloodPressurePTT.js')
  const uncalibrated = estimateBloodPressurePTT(180, null)
  assert.equal(uncalibrated.isCalibrated, false)
  assert.equal(uncalibrated.sbp, null)
  assert.equal(uncalibrated.dbp, null)

  const calibration = saveBpCalibration(126, 82, 180)
  const calibrated = estimateBloodPressurePTT(170, calibration)
  assert.equal(calibrated.isCalibrated, true)
  assert.equal(calibrated.sbp, 130)
  assert.equal(calibrated.dbp, 84)
})
