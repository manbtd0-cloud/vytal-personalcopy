export default function SignalMarker({
  label,
  state = 'idle',
  position = 50,
  active = false,
  className = '',
}) {
  return (
    <span
      className={`signal-marker signal-marker--${state}${active ? ' is-active' : ''} ${className}`.trim()}
      data-signal-marker
      data-signal-marker-state={state}
      style={{ '--signal-marker-position': `${position}%` }}
    >
      <span className="signal-marker__dot" aria-hidden="true" />
      {label ? <span className="signal-marker__label">{label}</span> : null}
    </span>
  )
}
