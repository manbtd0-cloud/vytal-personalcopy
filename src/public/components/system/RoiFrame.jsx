export default function RoiFrame({ state = 'lock', label, className = '' }) {
  return (
    <span className={`roi-frame roi-frame--${state} ${className}`.trim()} data-roi-frame data-roi-state={state}>
      <span className="roi-frame__corner roi-frame__corner--tl" aria-hidden="true" />
      <span className="roi-frame__corner roi-frame__corner--tr" aria-hidden="true" />
      <span className="roi-frame__corner roi-frame__corner--bl" aria-hidden="true" />
      <span className="roi-frame__corner roi-frame__corner--br" aria-hidden="true" />
      {label ? <span className="roi-frame__label">{label}</span> : null}
    </span>
  )
}
