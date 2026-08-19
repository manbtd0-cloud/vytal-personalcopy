import { useEffect, useMemo, useRef } from 'react'
import { gsap } from 'gsap'
import useReducedMotion from '../../hooks/useReducedMotion.js'
import SpectralSamples from './SpectralSamples.jsx'

const PATHS = {
  raw: 'M 0 92 C 82 74 128 116 205 96 S 350 73 430 108 S 560 80 648 101 S 824 90 1000 98',
  lock: 'M 0 96 C 105 88 150 102 242 94 S 408 89 510 97 S 680 90 790 96 S 915 91 1000 95',
  trusted: 'M 0 95 C 95 90 155 100 246 94 S 416 91 512 95 S 690 92 806 95 S 930 93 1000 95',
  context: 'M 0 122 C 110 118 180 104 270 108 S 430 77 520 87 S 675 70 770 74 S 910 56 1000 62',
  timeline: 'M 30 145 C 160 140 205 116 320 118 S 520 86 650 92 S 830 54 970 48',
  divider: 'M 0 95 C 225 94 390 96 520 95 S 780 94 1000 95',
}

const NETWORK_PATHS = [
  'M 20 95 C 190 94 280 91 420 94 S 650 94 980 94',
  'M 370 94 C 490 88 520 46 640 34 S 820 40 940 20',
  'M 530 95 C 650 104 700 144 835 152 S 925 152 980 160',
]

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export default function SignalThread({
  variant = 'raw',
  progress,
  direction = 'horizontal',
  tone = 'auto',
  density = 'normal',
  animate = true,
  decorative = true,
  className = '',
  children,
}) {
  const rootRef = useRef(null)
  const reducedMotion = useReducedMotion()
  const controlledProgress = typeof progress === 'number' ? clamp(progress, 0, 1) : null
  const paths = useMemo(
    () => variant === 'network' ? NETWORK_PATHS : [PATHS[variant] ?? PATHS.raw],
    [variant],
  )

  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined
    const lines = root.querySelectorAll('[data-signal-path]')

    const lengths = Array.from(lines).map((line) => (
      typeof line.getTotalLength === 'function' ? line.getTotalLength() : 1000
    ))

    lines.forEach((line, index) => {
      const length = lengths[index]
      gsap.set(line, { strokeDasharray: length })

      if (controlledProgress != null) {
        gsap.set(line, { strokeDashoffset: length * (1 - controlledProgress) })
      } else if (reducedMotion || !animate) {
        gsap.set(line, { strokeDashoffset: 0 })
      } else {
        gsap.fromTo(
          line,
          { strokeDashoffset: length },
          {
            strokeDashoffset: 0,
            duration: variant === 'raw' ? 1.55 : 1.1,
            delay: index * 0.12,
            ease: 'power2.out',
          },
        )
      }
    })

    return () => gsap.killTweensOf(lines)
  }, [animate, controlledProgress, reducedMotion, variant])

  const isRawLike = variant === 'raw' || variant === 'lock'

  return (
    <span
      ref={rootRef}
      className={`signal-thread signal-thread--${variant} signal-thread--${direction} signal-thread--${density} ${className}`.trim()}
      data-signal-thread
      data-signal-variant={variant}
      data-signal-tone={tone}
      data-signal-direction={direction}
      data-signal-density={density}
      aria-hidden={decorative ? 'true' : undefined}
    >
      {isRawLike ? <SpectralSamples density={density} /> : null}
      <svg className="signal-thread__svg" viewBox="0 0 1000 190" preserveAspectRatio="none" focusable="false" aria-hidden="true">
        {paths.map((path, index) => (
          <path
            key={`${variant}-${index}`}
            className={`signal-thread__path signal-thread__path--${index}`}
            data-signal-path
            d={path}
            pathLength="1000"
            fill="none"
          />
        ))}
      </svg>
      {children ? <span className="signal-thread__content">{children}</span> : null}
    </span>
  )
}
