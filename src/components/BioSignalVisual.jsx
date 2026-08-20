import { useRef } from 'react'

export default function BioSignalVisual({ onStart }) {
  const visualRef = useRef(null)

  function handlePointerMove(event) {
    const visual = visualRef.current
    if (!visual) return

    const rect = visual.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5

    visual.style.setProperty('--tilt-x', `${(-y * 11).toFixed(2)}deg`)
    visual.style.setProperty('--tilt-y', `${(x * 13).toFixed(2)}deg`)
    visual.style.setProperty('--glow-x', `${((x + 0.5) * 100).toFixed(1)}%`)
    visual.style.setProperty('--glow-y', `${((y + 0.5) * 100).toFixed(1)}%`)
  }

  function resetTilt() {
    const visual = visualRef.current
    if (!visual) return
    visual.style.setProperty('--tilt-x', '0deg')
    visual.style.setProperty('--tilt-y', '0deg')
    visual.style.setProperty('--glow-x', '50%')
    visual.style.setProperty('--glow-y', '45%')
  }

  return (
    <div
      ref={visualRef}
      className="bio-visual"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
      aria-label="Interactive three-dimensional visualization of a live biometric signal"
    >
      <div className="bio-visual__wash" aria-hidden="true" />

      <div className="bio-visual__topline">
        <span className="bio-live-pill"><span /> Live bio-signal</span>
        <span className="bio-visual__hint">Move to explore</span>
      </div>

      <div className="bio-scene" aria-hidden="true">
        <div className="bio-orbit bio-orbit--outer"><i /><i /><i /></div>
        <div className="bio-orbit bio-orbit--middle"><i /><i /></div>
        <div className="bio-orbit bio-orbit--inner" />

        <div className="bio-core">
          <div className="bio-core__aura" />
          <div className="bio-core__surface">
            <svg className="bio-heart" viewBox="0 0 120 108" fill="none">
              <defs>
                <linearGradient id="bioHeartFill" x1="18" y1="10" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ff8aa1" />
                  <stop offset="0.48" stopColor="#ff375f" />
                  <stop offset="1" stopColor="#d7003f" />
                </linearGradient>
                <filter id="bioHeartShadow" x="-40%" y="-40%" width="180%" height="190%">
                  <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#d7003f" floodOpacity="0.3" />
                </filter>
              </defs>
              <path
                d="M60 100S14 73 14 39C14 17 40 7 60 29 80 7 106 17 106 39c0 34-46 61-46 61Z"
                fill="url(#bioHeartFill)"
                filter="url(#bioHeartShadow)"
              />
              <path
                className="bio-heart__trace"
                d="M22 54h20l7-18 12 37 10-27 7 8h20"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M36 28c7-8 17-8 23-2" stroke="white" strokeOpacity="0.55" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className="bio-depth bio-depth--one" />
        <div className="bio-depth bio-depth--two" />
      </div>

      <div className="bio-metric bio-metric--heart">
        <span className="bio-metric__icon bio-metric__icon--pink">♥</span>
        <span><small>Heart signal</small><strong>Ready</strong></span>
      </div>
      <div className="bio-metric bio-metric--quality">
        <span className="bio-metric__ring">98</span>
        <span><small>Signal model</small><strong>rPPG</strong></span>
      </div>
      <div className="bio-metric bio-metric--offline">
        <span className="bio-metric__dot" />
        <span><small>Private by design</small><strong>Local first</strong></span>
      </div>

      <button type="button" className="bio-visual__start" onClick={onStart}>
        Begin screening <span aria-hidden="true">↘</span>
      </button>
    </div>
  )
}
