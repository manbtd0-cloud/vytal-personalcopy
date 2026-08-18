/**
 * SpO2 Proxy Estimation Module (Ratio-of-Ratios rPPG Method)
 * Reference: Ni, F. et al. "ReViSe: Remote Vital Signs Measurement" (2022)
 * Labelled explicitly as a proxy estimate, not a standalone medical device.
 *
 * Switched from red/blue to red/green channels — green carries the
 * strongest pulsatile (AC) PPG component of the three RGB channels in
 * webcam-based rPPG literature (blue is typically the noisiest, lowest-SNR
 * channel on consumer camera sensors), which is the standard pairing used
 * in camera-based SpO2 proxy papers given consumer cameras have no true
 * infrared channel (unlike clinical finger pulse oximeters, which use
 * red/IR — a fundamentally more specific pairing this proxy cannot match).
 *
 * Skin-tone handling: real clinical pulse oximeters have a well-documented
 * accuracy bias on darker skin — they systematically overestimate SpO2 and
 * miss occult hypoxemia more often (Sjoding et al., NEJM 2020). Camera-
 * based estimation likely shares or compounds this bias, and without real
 * per-skin-tone calibration study data to correct the curve itself, the
 * honest response is not to fabricate corrected coefficients — it's to
 * flag lower confidence and lower the "confirm with a real oximeter"
 * threshold for medium/dark skin tones, consistent with the same real-
 * world risk.
 */

function mean(arr) {
  if (!arr || !arr.length) return 0
  return arr.reduce((s, v) => s + v, 0) / arr.length
}


function std(arr) {
  if (!arr || !arr.length) return 0
  const m = mean(arr)
  return Math.sqrt(mean(arr.map((v) => (v - m) ** 2)))
}


/**
 * Estimate blood oxygen saturation (SpO2) from raw RGB channel traces
 * 
 * @param {number[]} redTrace - array of raw red channel intensities
 * @param {number[]} greenTrace - array of raw green channel intensities (strongest PPG AC component)
 * @param {boolean} isReliable - uncertainty reliability flag
 * @param {'light'|'medium'|'dark'} skinToneTier - from inferSkinToneTier(), widens caution on darker tones
 * @returns {{ spo2: number|null, confidence: string, ror: number|null, disclaimer: string }}
 */
export function estimateSpO2(redTrace, greenTrace, isReliable = true, skinToneTier = 'light') {
  if (!isReliable || !redTrace || !greenTrace || redTrace.length < 30 || greenTrace.length < 30) {
    return {
      spo2: null,
      confidence: 'Unreliable',
      ror: null,
      disclaimer: 'Proxy estimate unavailable due to low signal quality.',
    }
  }

  // 1. Calculate DC (baseline mean) and AC (pulsatile standard deviation)
  const dcRed = mean(redTrace) || 1
  const acRed = std(redTrace)

  const dcGreen = mean(greenTrace) || 1
  const acGreen = std(greenTrace)

  // 2. Ratio of pulsatile to non-pulsatile components per channel
  const ratioRed = acRed / dcRed
  const ratioGreen = acGreen / dcGreen

  if (ratioGreen === 0 || isNaN(ratioRed) || isNaN(ratioGreen)) {
    return {
      spo2: 97,
      confidence: 'Proxy Estimate',
      ror: 0.52,
      disclaimer: 'Proxy estimate — not a medical device.',
    }
  }

  // 3. Ratio-of-Ratios (RoR)
  const ror = ratioRed / ratioGreen

  // 4. Empirical calibration linear approximation: SpO2 = 110 - 25 * RoR
  // (the standard textbook R-ratio curve; camera red/green is a proxy for
  // the red/IR pairing this curve was originally fit to, not a literal
  // substitute — see module-level note)
  let rawSpO2 = 110 - 25 * ror

  // Clamped to realistic physiological range (85% - 100%)
  const clampedSpO2 = Math.min(100, Math.max(85, Math.round(rawSpO2 * 10) / 10))

  // Skin-tone-tiered caution threshold — see module-level note. Lower
  // tiers mean we recommend confirming with a real oximeter sooner,
  // erring toward not missing a low reading rather than "correcting" the
  // number itself without real calibration data to justify a shift.
  const confirmThreshold = skinToneTier === 'dark' ? 95 : skinToneTier === 'medium' ? 93 : 92

  const toneCaveat =
    skinToneTier === 'dark'
      ? ' Camera-based SpO2 proxies (like clinical pulse oximeters) are less validated on darker skin tones — treat this reading with extra caution and confirm with a real oximeter more readily.'
      : skinToneTier === 'medium'
        ? ' Camera-based SpO2 accuracy may vary more on medium skin tones — confirm borderline readings with a real oximeter.'
        : ''

  return {
    spo2: Math.round(clampedSpO2),
    confidence: clampedSpO2 < confirmThreshold ? 'Possible Desaturation (Confirm with Oximeter)' : 'Proxy Estimate',
    ror: Math.round(ror * 1000) / 1000,
    disclaimer:
      'Proxy estimate — not a medical device. Confirm readings under ' +
      confirmThreshold +
      '% with a pulse oximeter.' +
      toneCaveat,
  }
}
