export const QUALITY_FLAGS = Object.freeze({
  LOW_FRAME_RATE: 1 << 0,
  LOW_RESOLUTION: 1 << 1,
  POOR_LIGHTING: 1 << 2,
  EXCESSIVE_MOTION: 1 << 3,
  UNRELIABLE_SIGNAL: 1 << 4,
})

export function createQualityMask({ camera, lightingTier, motionTier, uncertainty }) {
  let mask = 0
  if ((camera?.fps ?? 0) < 24) mask |= QUALITY_FLAGS.LOW_FRAME_RATE
  if ((camera?.megapixels ?? 0) < 0.9) mask |= QUALITY_FLAGS.LOW_RESOLUTION
  if (['poor', 'dim'].includes(lightingTier)) mask |= QUALITY_FLAGS.POOR_LIGHTING
  if (motionTier === 'large') mask |= QUALITY_FLAGS.EXCESSIVE_MOTION
  if (uncertainty?.reliable === false) mask |= QUALITY_FLAGS.UNRELIABLE_SIGNAL
  return mask
}

export function hasQualityFlag(mask, flag) {
  return (mask & flag) === flag
}
