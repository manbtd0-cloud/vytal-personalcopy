import { useState, useEffect, useRef } from 'react'

export default function SplashAnimation({ onFinish }) {
  const [stage, setStage] = useState('intro') // intro | trace | title | fadeout
  const onFinishRef = useRef(onFinish)

  useEffect(() => {
    onFinishRef.current = onFinish
  }, [onFinish])

  useEffect(() => {
    const t1 = setTimeout(() => setStage('trace'), 200)
    const t2 = setTimeout(() => setStage('title'), 900)
    const t3 = setTimeout(() => setStage('fadeout'), 2600)
    const t4 = setTimeout(() => {
      onFinishRef.current?.()
    }, 3100)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, []) // Empty dependency array guarantees timers run cleanly without reset

  return (
    <div
      className={`splash-overlay ${stage === 'fadeout' ? 'is-fading' : ''}`}
      onClick={() => {
        setStage('fadeout')
        setTimeout(() => onFinishRef.current?.(), 400)
      }}
      style={{ cursor: 'pointer' }}
    >
      <div className="splash-card">
        <div className="splash-index">VYTAL / HEALTH, IN VIEW</div>
        <div className="splash-logo-box" aria-hidden="true">
          <svg
            width="120"
            height="120"
            viewBox="0 0 100 100"
            fill="none"
            className="splash-svg"
          >
            <path
              d="M 15 50 L 35 50 L 45 20 L 58 80 L 70 42 L 80 50 L 95 50"
              stroke="currentColor"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="splash-pulse-path"
            />
          </svg>
        </div>
        <div className={`splash-text ${stage === 'title' || stage === 'fadeout' ? 'show' : ''}`}>
          <h1 className="splash-brand">VYTAL</h1>
          <p className="splash-sub">A clearer, more personal way to read everyday health signals.</p>
          <span className="splash-skip-hint">Tap anywhere to enter</span>
        </div>
      </div>
    </div>
  )
}
