const SAMPLE_SETS = {
  quiet: [
    [8, 48, 0], [24, 55, 1], [41, 44, 2], [59, 52, 0], [78, 46, 1], [92, 54, 2],
  ],
  normal: [
    [5, 50, 0], [14, 42, 1], [22, 57, 2], [31, 47, 0], [40, 61, 1], [49, 45, 2],
    [58, 53, 0], [67, 39, 1], [76, 58, 2], [85, 46, 0], [94, 52, 1],
  ],
  dense: [
    [3, 48, 0], [9, 58, 1], [15, 41, 2], [21, 52, 0], [27, 45, 1], [33, 62, 2],
    [39, 47, 0], [45, 55, 1], [51, 39, 2], [57, 50, 0], [63, 59, 1], [69, 43, 2],
    [75, 54, 0], [81, 46, 1], [87, 61, 2], [93, 49, 0], [97, 55, 1],
  ],
}

export default function SpectralSamples({ density = 'normal', className = '' }) {
  const samples = SAMPLE_SETS[density] ?? SAMPLE_SETS.normal

  return (
    <span className={`signal-samples signal-samples--${density} ${className}`.trim()} aria-hidden="true">
      {samples.map(([x, y, channel], index) => (
        <span
          key={`${x}-${y}-${index}`}
          className={`signal-samples__point signal-samples__point--channel-${channel}`}
          data-spectral-sample
          data-sample-index={index}
          style={{ left: `${x}%`, top: `${y}%` }}
        />
      ))}
    </span>
  )
}
