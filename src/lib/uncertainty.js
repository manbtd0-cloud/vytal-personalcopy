/**
 * Vytal Reading Uncertainty & Camera Quality Assessment
 *
 * Implements the transparent heuristic scoring model described in the
 * Vytal Reading Uncertainty Algorithm spec, built on empirical rPPG
 * benchmarking literature (see inline MEASURED / HEURISTIC annotations).
 *
 * Public exports:
 *   assessCameraQuality(stream, facingModeHint)
 *   estimateUncertainty(capture, liveConfidence)
 *   inferLightingTier(meanBrightness, brightnessVariance?)
 *   inferMotionTier(brightnessHistory)
 */

// ─── Internal helpers ────────────────────────────────────────────────────────

/**
 * Infer camera tier using both track.getSettings() and track.getCapabilities().
 * getCapabilities() tells us what the hardware CAN do (max resolution, torch,
 * zoom), which is a better proxy for sensor quality than the negotiated stream
 * settings alone.
 *
 * Source: rPPG benchmark — HD > webcam > mobile front-facing. HEURISTIC tiers.
 */
function inferCameraTier(settings, facingMode, capabilities = {}) {
  const w   = settings.width  || 0
  const h   = settings.height || 0
  const mp  = (w * h) / 1_000_000

  const maxW  = capabilities.width?.max  || w
  const maxH  = capabilities.height?.max || h
  const maxMp = (maxW * maxH) / 1_000_000

  const hasTorch = Boolean(capabilities.torch)

  // Rear camera with LED torch = highest rPPG quality (used in fingertip mode)
  if (hasTorch && facingMode === 'environment') return 'hdOrRear'

  // High-max-resolution rear/environment camera
  if (facingMode === 'environment' && maxMp >= 1.5) return 'hdOrRear'

  // High-res webcam (desktop) — stream MP is the real indicator here
  if (mp >= 1.5 && facingMode !== 'user') return 'hdOrRear'

  // Front-facing mobile camera (weaker sensor, more compression, worse rPPG)
  if (facingMode === 'user') return 'mobileFront'

  // Standard desktop webcam
  return 'webcam'
}

/**
 * Infer compression tier from stream settings and capabilities.
 * Browser getUserMedia always uses a modern codec (H.264 / H.265), but the
 * effective bit-rate and compression ratio varies with resolution.
 * Very low resolution = high compression ratio = more blocking artifacts.
 */
function inferCompressionTier(megapixels) {
  if (megapixels >= 0.9) return 'modernCodecTypical' // MEASURED: H.265 adds ~0.3 bpm
  if (megapixels >= 0.3) return 'modernCodecTypical'
  return 'heavy'                                      // sub-VGA = severe compression
}

function fpsGrade(fps) {
  if (fps >= 30) return 'Excellent'
  if (fps >= 24) return 'Good'
  if (fps >= 20) return 'Fair'
  if (fps >= 15) return 'Poor'
  return 'Unusable'
}

function resolutionGrade(mp) {
  if (mp >= 2)   return 'High'
  if (mp >= 0.9) return 'Standard'
  if (mp >= 0.3) return 'Low'
  return 'Very Low'
}

/**
 * Compute 0–100 camera quality score.
 *
 * Scoring breakdown (100 pts total):
 *   FPS (40 pts)          — most important rPPG factor; below 15 fps is unusable
 *   Current MP (20 pts)   — actual resolution delivered to the pipeline
 *   Max FPS cap (15 pts)  — hardware capability ceiling (future-proofing)
 *   Camera tier (15 pts)  — sensor + optical quality class
 *   Hardware bonus (10 pts) — torch, high sensor MP, optical zoom
 */
function computeQualityScore(fps, megapixels, cameraTier, maxFps, hasTorch, maxMegapixels) {
  // FPS score (40 pts)
  let fpsScore
  if (fps >= 30)      fpsScore = 40
  else if (fps >= 24) fpsScore = 30
  else if (fps >= 20) fpsScore = 20
  else if (fps >= 15) fpsScore = 10
  else                fpsScore = 2

  // Current megapixels (20 pts)
  let mpScore
  if (megapixels >= 2)    mpScore = 20
  else if (megapixels >= 1)   mpScore = 15
  else if (megapixels >= 0.5) mpScore = 10
  else if (megapixels >= 0.3) mpScore = 5
  else                        mpScore = 1

  // Max FPS capability (15 pts) — indicates sensor / hardware class
  let maxFpsScore
  if (maxFps >= 60)      maxFpsScore = 15
  else if (maxFps >= 30) maxFpsScore = 10
  else if (maxFps >= 24) maxFpsScore = 6
  else                   maxFpsScore = 2

  // Camera tier (15 pts)
  const tierScore =
    cameraTier === 'hdOrRear'   ? 15 :
    cameraTier === 'webcam'     ? 10 : 5

  // Hardware bonus (up to 10 pts)
  let hwBonus = 0
  if (hasTorch)              hwBonus += 5  // LED flash = controlled illumination
  if (maxMegapixels >= 8)    hwBonus += 3  // high-resolution sensor
  else if (maxMegapixels >= 4) hwBonus += 1

  return Math.min(100, Math.round(fpsScore + mpScore + maxFpsScore + tierScore + hwBonus))
}

/**
 * Build the AI-style explanation shown in the camera quality panel.
 * Tone matches the main triage explanation — calm, specific, actionable.
 */
function buildQualityExplanation(
  fps, megapixels, cameraTier, score,
  maxFps, maxMegapixels, hasTorch, exposureMode
) {
  const tierLabel =
    cameraTier === 'hdOrRear'   ? 'rear / HD camera' :
    cameraTier === 'webcam'     ? 'webcam'            : 'front-facing mobile camera'

  const fpsNote   = fpsGrade(fps)
  const resNote   = resolutionGrade(megapixels)
  const capLine   = maxFps > fps
    ? ` (hardware capable of up to ${maxFps} fps)`
    : ''
  const torchLine = hasTorch ? ' LED torch detected — ideal for fingertip + flash mode.' : ''
  const expLine   = exposureMode === 'manual'
    ? ' Manual exposure lock detected — excellent for signal stability.'
    : ' Auto-exposure active — keep lighting consistent during the scan.'

  let verdict
  if (score >= 80) {
    verdict =
      'This camera meets or exceeds conditions in which rPPG algorithms are clinically validated. ' +
      'Reading uncertainty is at its minimum for this device.'
  } else if (score >= 55) {
    verdict =
      'This camera is adequate for rPPG screening. A modest uncertainty margin applies. ' +
      'Stable lighting and keeping still will improve accuracy.'
  } else if (score >= 35) {
    verdict =
      'Camera conditions are below the optimal rPPG range. Uncertainty is elevated. ' +
      'Readings are still informative — interpret them with the margin shown. ' +
      'Switching to fingertip + flash mode will give a more reliable signal on this device.'
  } else {
    verdict =
      'Camera quality is below the threshold for confident rPPG measurement. ' +
      'Fingertip + flash mode is strongly recommended. ' +
      'If available, use a device with a higher frame rate or a rear camera.'
  }

  return (
    `Detected: ${tierLabel} — ${megapixels.toFixed(1)} MP at ${fps} fps${capLine}. ` +
    `Frame rate: ${fpsNote} — Resolution: ${resNote}.` +
    torchLine + expLine + ' ' + verdict
  )
}

// ─── Public: Camera quality assessment ───────────────────────────────────────

/**
 * assessCameraQuality
 *
 * Reads both track.getSettings() (negotiated stream values) and
 * track.getCapabilities() (hardware ceiling values) for a richer picture.
 *
 * @param {MediaStream} stream
 * @param {string} facingModeHint — 'user' | 'environment'
 * @returns {{ fps, megapixels, maxFps, maxMegapixels, hasTorch,
 *             cameraTier, compressionTier, qualityScore, grade, explanation }}
 */
export function assessCameraQuality(stream, facingModeHint = 'user') {
  const [track] = stream.getVideoTracks()
  if (!track) {
    return {
      fps: 0, megapixels: 0, maxFps: 0, maxMegapixels: 0,
      hasTorch: false, cameraTier: 'mobileFront',
      compressionTier: 'heavy', qualityScore: 0,
      grade: 'Unknown',
      explanation: 'No video track found. Camera quality could not be assessed.',
    }
  }

  const settings     = track.getSettings()
  const capabilities = track.getCapabilities?.() || {}

  // Negotiated (actual stream) values
  const fps        = Math.round(settings.frameRate || 0)
  const w          = settings.width  || 0
  const h          = settings.height || 0
  const megapixels = parseFloat(((w * h) / 1_000_000).toFixed(2))

  // Hardware ceiling values
  const maxW          = capabilities.width?.max  || w
  const maxH          = capabilities.height?.max || h
  const maxMegapixels = parseFloat(((maxW * maxH) / 1_000_000).toFixed(2))
  const maxFps        = Math.round(capabilities.frameRate?.max || fps)

  // Hardware features
  const hasTorch    = Boolean(capabilities.torch)
  const exposureMode = settings.exposureMode || 'continuous' // 'manual'|'continuous'

  // Facing mode: browser-reported is most reliable
  const facingMode = settings.facingMode || facingModeHint

  const cameraTier      = inferCameraTier(settings, facingMode, capabilities)
  const compressionTier = inferCompressionTier(megapixels)
  const qualityScore    = computeQualityScore(fps, megapixels, cameraTier, maxFps, hasTorch, maxMegapixels)

  let grade
  if (qualityScore >= 80)      grade = 'Excellent'
  else if (qualityScore >= 55) grade = 'Good'
  else if (qualityScore >= 35) grade = 'Fair'
  else                         grade = 'Poor'

  const explanation = buildQualityExplanation(
    fps, megapixels, cameraTier, qualityScore,
    maxFps, maxMegapixels, hasTorch, exposureMode
  )

  return {
    fps, megapixels, maxFps, maxMegapixels,
    hasTorch, cameraTier, compressionTier,
    qualityScore, grade, explanation,
  }
}

// ─── Public: Reading uncertainty estimation ───────────────────────────────────

/**
 * inferSkinToneTier
 *
 * Estimates a coarse skin-tone tier from the mean RGB of the rPPG capture
 * ROI, via the Individual Typology Angle (ITA°) — the standard
 * dermatological method for classifying skin tone from reflectance,
 * correlated with the Fitzpatrick scale (del Bino & Bernerd 2013 and
 * widely used since). ITA is computed from CIE-Lab lightness and b-channel
 * values, which is a more
 * lighting-robust classification than raw RGB brightness.
 *
 * Used to widen the uncertainty estimate: rPPG literature consistently
 * reports roughly 2x higher bpm error on darker skin tones (lower green-
 * channel reflectance / higher melanin absorption reduces the pulsatile
 * signal-to-noise ratio), which was not modeled at all previously.
 *
 * @param {number} meanR, meanG, meanB — mean 0-255 RGB of the capture ROI
 * @returns {'light'|'medium'|'dark'}
 */
export function inferSkinToneTier(meanR, meanG, meanB) {
  // sRGB (0-255) -> linear sRGB (0-1)
  const toLinear = (c) => {
    const v = c / 255
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  }
  const r = toLinear(meanR)
  const g = toLinear(meanG)
  const b = toLinear(meanB)

  // linear sRGB -> CIE XYZ (D65)
  const X = r * 0.4124 + g * 0.3576 + b * 0.1805
  const Y = r * 0.2126 + g * 0.7152 + b * 0.0722
  const Z = r * 0.0193 + g * 0.1192 + b * 0.9505

  // XYZ -> CIE Lab (D65 reference white)
  const Xn = 0.9505, Yn = 1.0, Zn = 1.089
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  const fx = f(X / Xn), fy = f(Y / Yn), fz = f(Z / Zn)
  const L = 116 * fy - 16
  const bStar = 200 * (fy - fz)

  // Individual Typology Angle
  const ita = (Math.atan2(L - 50, bStar) * 180) / Math.PI

  // Six-class ITA scale collapsed to three practical uncertainty tiers
  if (ita > 41) return 'light' // Very light / Light
  if (ita > 10) return 'medium' // Intermediate / Tan
  return 'dark' // Brown / Dark
}

/**
 * estimateUncertainty
 *
 * Transparent, cited heuristic. Every penalty below is either MEASURED from
 * the 2020 rPPG benchmark paper or marked HEURISTIC where interpolated.
 *
 * @param {object} capture
 *   { fps, cameraTier, compressionTier, lightingTier, motionTier, windowSeconds, skinToneTier }
 * @param {number} liveConfidence  — 0–1, normalised Goertzel SNR
 */
export function estimateUncertainty(capture, liveConfidence) {
  // MEASURED floor — near-lossless benchmark result ~0.22–0.36 bpm
  let bpmError = 0.5

  // Frame-rate tier — HEURISTIC (fps/resolution tradeoff literature)
  if (capture.fps < 15)      bpmError += 4
  else if (capture.fps < 20) bpmError += 2
  else if (capture.fps < 30) bpmError += 1

  // Camera sensor tier — HEURISTIC (HD > webcam > mobile front pattern)
  if (capture.cameraTier === 'mobileFront') bpmError += 3
  else if (capture.cameraTier === 'webcam') bpmError += 1

  // Compression tier — MEASURED for modern codec; HEURISTIC for heavy
  if (capture.compressionTier === 'heavy')              bpmError += 2
  else if (capture.compressionTier === 'modernCodecTypical') bpmError += 0.3

  // Lighting tier — HEURISTIC
  if (capture.lightingTier === 'poor')      bpmError += 2
  else if (capture.lightingTier === 'dim')  bpmError += 1

  // Motion tier — MEASURED ranges (1–3 bpm for large motion, 0.05 for minor)
  if (capture.motionTier === 'large')       bpmError += 2
  else if (capture.motionTier === 'minor')  bpmError += 0.05

  // Skin-tone tier — HEURISTIC, ~2x reported error widening on darker skin
  // (lower green-channel PPG amplitude). Applied as a multiplier on the
  // error accumulated so far, not a flat add, since it compounds with
  // every other degradation above.
  let skinToneMultiplier = 1
  if (capture.skinToneTier === 'dark') skinToneMultiplier = 2
  else if (capture.skinToneTier === 'medium') skinToneMultiplier = 1.35
  bpmError *= skinToneMultiplier

  // Window length multiplier — MEASURED anchor (2s ≈ 7×), interpolated between
  let windowMultiplier = 1
  if (capture.windowSeconds < 5)       windowMultiplier = 4
  else if (capture.windowSeconds < 10) windowMultiplier = 2
  else if (capture.windowSeconds < 20) windowMultiplier = 1.3

  bpmError *= windowMultiplier

  // Blend with live signal confidence (low confidence widens the final range)
  const clampedConf = Math.max(0, Math.min(1, liveConfidence))
  const blended = bpmError * (1.6 - clampedConf)

  // MEASURED: dummy 75 bpm guesser scores 8–17 bpm MAE across 13 datasets
  const blindGuessFloor = 8
  if (blended >= blindGuessFloor) {
    return {
      reliable: false,
      message:
        'Signal too weak to produce a reliable reading — try fingertip + flash mode for a stronger signal.',
    }
  }

  return {
    reliable: true,
    uncertaintyBpm: Math.round(blended * 10) / 10,
  }
}

// ─── Public: Real-time condition inference ────────────────────────────────────

/**
 * inferLightingTier
 *
 * Improved: handles overexposure (clipped signal is as bad as dark), and uses
 * brightness variance when available to detect flickering/uneven lighting.
 *
 * @param {number} meanBrightness   — average pixel brightness 0–255
 * @param {number|null} variance    — per-frame brightness variance (optional)
 * @returns {'good'|'dim'|'poor'}
 */
export function inferLightingTier(meanBrightness, variance = null) {
  // Overexposure: saturated pixels clip the rPPG signal as badly as darkness
  if (meanBrightness > 215) return 'poor'

  // Flickering / uneven lighting (high variance = monitor, fluorescent, sunlight patches)
  if (variance !== null) {
    if (variance > 250) return 'poor'
    if (variance > 70)  return 'dim'
  }

  // Standard brightness thresholds (~500 lux = good, <100 lux = dim)
  if (meanBrightness >= 80) return 'good'
  if (meanBrightness >= 35) return 'dim'
  return 'poor'
}

/**
 * inferMotionTier
 *
 * Improved: uses frame-to-frame *differences* (fast motion) rather than global
 * variance (which conflates slow lighting drift with actual head movement).
 * Fast motion is far more damaging to rPPG than slow illumination changes.
 *
 * @param {number[]} brightnessHistory — per-frame brightness values
 * @returns {'still'|'minor'|'large'}
 */
export function inferMotionTier(brightnessHistory) {
  if (!brightnessHistory || brightnessHistory.length < 5) return 'minor'

  // Frame-to-frame absolute differences — captures fast motion specifically
  const diffs = []
  for (let i = 1; i < brightnessHistory.length; i++) {
    diffs.push(Math.abs(brightnessHistory[i] - brightnessHistory[i - 1]))
  }
  const meanDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length
  const maxDiff  = Math.max(...diffs)

  // Large: abrupt, large jumps — head movement, finger lifted
  if (maxDiff > 28 || meanDiff > 7) return 'large'
  // Minor: small consistent drift — normal breathing, subtle sway
  if (maxDiff > 10 || meanDiff > 2.5) return 'minor'
  return 'still'
}
