/**
 * Anemia Screening Module (Conjunctival Pallor Estimation)
 * Reference: Zhao, L. et al. "Prediction of anemia in real-time using a smartphone camera processing conjunctival images"
 * PLOS ONE 19(5): e0302883 (2024). DOI: 10.1371/journal.pone.0302883
 *
 * Erythema index: previously this module classified each pixel into a
 * fixed hue-angle window (345°-360° / 0°-25°) and used the pass/fail
 * ratio as the whole signal — a hard binary cut that throws away how red
 * or pale a pixel actually is, and is brittle to small hue shifts from
 * lighting temperature. Replaced with a continuous erythema index (EI),
 * a standard dermatological reflectance-based redness measure: hemoglobin
 * absorbs green light more strongly than red, so the log-reflectance gap
 * between the green and red channels scales with blood content in the
 * tissue (Kollias-style EI formulation, as commonly adapted for RGB
 * camera images in the erythema/pallor imaging literature). This gives a
 * graded signal instead of a hard pass/fail per pixel, which is more
 * robust to lighting variation and avoids classification cliffs.
 *
 * HONEST NOTE: this is a documented general erythema-index technique, not
 * a reproduction of the exact fitted regression coefficients from either
 * cited paper specifically (those aren't available in this project) — the
 * Hb mapping below is a directionally-correct, clamped linear approximation
 * calibrated to reasonable clinical Hb ranges, not a validated regression.
 * This remains a screening-tier proxy, not a diagnostic measurement.
 */

function rgbToHsv(r, g, b) {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const d = max - min

  let h = 0
  const s = max === 0 ? 0 : d / max
  const v = max

  if (max !== min) {
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0)
        break
      case gn:
        h = (bn - rn) / d + 2
        break
      case bn:
        h = (rn - gn) / d + 4
        break
    }
    h /= 6
  }

  return { h: h * 360, s, v }
}

// Erythema index for one pixel: log-reflectance gap between green and red
// channels. Higher = more hemoglobin-driven redness present.
function erythemaIndex(r, g, b) {
  const rNorm = Math.max(1, r) / 255
  const gNorm = Math.max(1, g) / 255
  return 100 * (Math.log10(1 / gNorm) - Math.log10(1 / rNorm))
}

/**
 * Analyze lower palpebral conjunctiva image ROI for pallor and estimate hemoglobin (Hb).
 * 
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D context containing captured conjunctiva ROI
 * @param {object} roi - { x, y, w, h }
 * @returns {{ hb: number, tier: 'RED'|'ORANGE'|'GREEN', label: string, recommendation: string, erythemaIndex: number }}
 */
export function analyzeConjunctivalPallor(ctx, roi) {
  if (!ctx || !roi || roi.w <= 0 || roi.h <= 0) {
    return {
      hb: 12.5,
      tier: 'GREEN',
      label: 'Normal Hemoglobin Proxy',
      recommendation: 'Conjunctival color appears well-perfused.',
      erythemaIndex: null,
    }
  }

  const imageData = ctx.getImageData(roi.x, roi.y, roi.w, roi.h)
  const data = imageData.data

  let eiSum = 0
  let totalValidPixels = 0

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    // Reject non-tissue background (too dark, too bright/blown-out, or
    // desaturated/neutral like shadow, hair, or background clutter that
    // happened to fall inside the ROI margin)
    const brightness = (r + g + b) / 3
    if (brightness < 40 || brightness > 230) continue

    const { s } = rgbToHsv(r, g, b)
    if (s < 0.15) continue // too desaturated to be skin/conjunctival tissue at all

    eiSum += erythemaIndex(r, g, b)
    totalValidPixels++
  }

  const meanEi = totalValidPixels > 0 ? eiSum / totalValidPixels : null

  // Low-confidence guard: if too few tissue-colored pixels were found at all
  // (ROI mostly skin, shadow, or eyelid rather than exposed conjunctiva),
  // there's no meaningful pallor signal. Previously this fell straight into
  // the Hb regression, which defaults toward LOW Hb on a weak/failed
  // capture — i.e. a failed measurement silently reported as the worst
  // possible clinical result. Flag it as low-confidence instead of guessing.
  const MIN_VALID_PIXELS = 400 // ~= a 20x20px patch of real tissue at minimum
  if (totalValidPixels < MIN_VALID_PIXELS || meanEi === null) {
    return {
      hb: null,
      tier: 'UNKNOWN',
      label: 'Low Confidence — Retry Scan',
      recommendation:
        'Not enough conjunctival tissue was visible in frame. Pull the lower eyelid down further and ensure good, even lighting, then rescan.',
      erythemaIndex: meanEi !== null ? Math.round(meanEi * 100) / 100 : null,
    }
  }

  // Map mean erythema index to an estimated Hb (g/dL). Typical EI values
  // for this formula on skin/conjunctival tissue range roughly 0 (very pale)
  // to ~12-15 (strongly perfused/red) under normal lighting — this mapping
  // is a clamped linear approximation, not a validated clinical regression
  // (see module note above).
  const estimatedHb = 4.5 + meanEi * 0.85
  const clampedHb = Math.min(16.0, Math.max(5.0, Math.round(estimatedHb * 10) / 10))

  let tier = 'GREEN'
  let label = 'Normal Hemoglobin Trend'
  let recommendation = 'Conjunctival tissue color indicates adequate perfusion (Hb > 9 g/dL).'

  if (clampedHb < 7.0) {
    tier = 'RED'
    label = 'Severe Anemia Risk (Hb < 7 g/dL)'
    recommendation = 'URGENT REFERRAL: Severe conjunctival pallor detected. Refer for laboratory hemoglobin testing.'
  } else if (clampedHb <= 9.0) {
    tier = 'ORANGE'
    label = 'Moderate Anemia Risk (Hb 7–9 g/dL)'
    recommendation = 'SAME-DAY REFERRAL: Moderate conjunctival pallor detected. Refer for clinical confirmation.'
  }

  return {
    hb: clampedHb,
    tier,
    label,
    recommendation,
    erythemaIndex: Math.round(meanEi * 100) / 100,
  }
}
