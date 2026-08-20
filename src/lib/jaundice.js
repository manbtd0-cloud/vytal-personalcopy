/**
 * Jaundice Screening Module (Scleral Icterus Analysis)
 * Reference: Mariakakis, A. et al. "BiliScreen: Smartphone-Based Scleral Jaundice Monitoring"
 * Proc. ACM Interact. Mob. Wearable Ubiquitous Technol. (2017)
 *
 * Ambient-light correction: BiliScreen's own method uses a two-shot
 * flash-difference capture to cancel ambient lighting color temperature.
 * That's not implementable here as a literal reproduction — the jaundice
 * capture path uses the front-facing camera (for the same reason face
 * scanning does: the user needs to see themselves to frame the shot), and
 * front cameras on essentially all consumer devices have no flash/torch to
 * take a second flash-lit reference frame against.
 *
 * Implemented instead: gray-world color-constancy normalization — a
 * standard, well-established white-balance technique that estimates the
 * ambient illuminant from the whole captured frame (assuming the scene's
 * average color should be neutral gray) and corrects the sclera ROI's
 * pixels against it before classifying yellow hue. This achieves the same
 * underlying goal BiliScreen's two-shot method targets — removing ambient
 * color-temperature bias from the reading — through a single-shot method
 * that's actually deployable on this camera path. It is NOT a
 * reproduction of BiliScreen's specific two-shot algorithm.
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

// Gray-world ambient illuminant estimate from the full captured frame
// (sampled, not every pixel, for speed — a coarse estimate is sufficient
// for this correction). Returns per-channel correction multipliers.
function estimateGrayWorldCorrection(ctx) {
  try {
    const w = ctx.canvas.width
    const h = ctx.canvas.height
    if (!w || !h) return { rGain: 1, gGain: 1, bGain: 1 }

    const { data } = ctx.getImageData(0, 0, w, h)
    let rSum = 0, gSum = 0, bSum = 0, n = 0
    const step = 16 * 4 // sample every 16th pixel for speed
    for (let i = 0; i < data.length; i += step) {
      rSum += data[i]
      gSum += data[i + 1]
      bSum += data[i + 2]
      n++
    }
    if (n === 0) return { rGain: 1, gGain: 1, bGain: 1 }

    const rAvg = rSum / n || 1
    const gAvg = gSum / n || 1
    const bAvg = bSum / n || 1
    const grayTarget = (rAvg + gAvg + bAvg) / 3

    // Clamp gains to a sane range so a degenerate frame (e.g. nearly all
    // one color) can't wildly over-correct
    const clampGain = (g) => Math.max(0.6, Math.min(1.6, g))

    return {
      rGain: clampGain(grayTarget / rAvg),
      gGain: clampGain(grayTarget / gAvg),
      bGain: clampGain(grayTarget / bAvg),
    }
  } catch (e) {
    console.warn('Gray-world correction failed, using uncorrected pixels', e)
    return { rGain: 1, gGain: 1, bGain: 1 }
  }
}

/**
 * Analyze sclera (white of eye) for yellowing (icterus / bilirubin elevation).
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas context with captured sclera ROI
 * @param {object} roi - { x, y, w, h }
 * @returns {{ isJaundiced: boolean, yellowIndex: number, label: string, recommendation: string }}
 */
export function analyzeScleralIcterus(ctx, roi) {
  if (!ctx || !roi || roi.w <= 0 || roi.h <= 0) {
    return {
      isJaundiced: false,
      yellowIndex: null,
      tier: 'UNKNOWN',
      label: 'Low Confidence — Retry Scan',
      recommendation: 'No valid sclera capture was available. Keep both eyes open in even lighting and retry.',
    }
  }

  const { rGain, gGain, bGain } = estimateGrayWorldCorrection(ctx)

  const imageData = ctx.getImageData(roi.x, roi.y, roi.w, roi.h)
  const data = imageData.data

  let yellowPixelCount = 0
  let totalScleraPixels = 0

  for (let i = 0; i < data.length; i += 4) {
    // Ambient-corrected channels (see estimateGrayWorldCorrection above)
    const r = Math.min(255, data[i] * rGain)
    const g = Math.min(255, data[i + 1] * gGain)
    const b = Math.min(255, data[i + 2] * bGain)

    // Reject non-sclera dark pixels or skin
    const brightness = (r + g + b) / 3
    if (brightness < 70) continue

    const { h, s } = rgbToHsv(r, g, b)

    // Yellow hue band: 45° to 65° in HSV space
    if (h >= 42 && h <= 68 && s >= 0.22) {
      yellowPixelCount++
    }
    totalScleraPixels++
  }

  if (totalScleraPixels < 400) {
    return {
      isJaundiced: false,
      yellowIndex: null,
      tier: 'UNKNOWN',
      label: 'Low Confidence — Retry Scan',
      recommendation: 'Not enough well-lit sclera pixels were visible. Reframe both eyes in even lighting and retry.',
    }
  }

  const yellowRatio = yellowPixelCount / totalScleraPixels
  const yellowIndex = Math.round(yellowRatio * 100)

  const isJaundiced = yellowIndex >= 22

  return {
    isJaundiced,
    yellowIndex,
    tier: isJaundiced ? 'ORANGE' : 'GREEN',
    label: isJaundiced ? 'Scleral Icterus Detected (Elevated Bilirubin Proxy)' : 'Normal Sclera Chromaticity',
    recommendation: isJaundiced
      ? 'REFERRAL RECOMMENDED: Yellowing detected on sclera region. Refer for serum bilirubin blood testing.'
      : 'Sclera chromaticity within normal non-icteric baseline.',
  }
}
