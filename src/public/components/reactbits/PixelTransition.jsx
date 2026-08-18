import { useEffect, useMemo, useRef } from 'react'
import { gsap } from 'gsap'

export default function PixelTransition({
  firstContent,
  secondContent,
  active = false,
  gridSize = 7,
  pixelColor = 'var(--accent)',
  animationStepDuration = 0.34,
  className = '',
}) {
  const gridRef = useRef(null)
  const firstRef = useRef(null)
  const secondRef = useRef(null)
  const pixels = useMemo(
    () => Array.from({ length: gridSize * gridSize }, (_, index) => index),
    [gridSize],
  )

  useEffect(() => {
    const grid = gridRef.current
    const first = firstRef.current
    const second = secondRef.current
    if (!grid || !first || !second) return undefined

    const pixelNodes = grid.querySelectorAll('[data-rb-pixel]')
    const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    gsap.killTweensOf(pixelNodes)
    gsap.killTweensOf([first, second])

    if (reduce) {
      gsap.set(pixelNodes, { opacity: 0 })
      gsap.set(first, { opacity: active ? 0 : 1 })
      gsap.set(second, { opacity: active ? 1 : 0 })
      return undefined
    }

    gsap.set(pixelNodes, { opacity: 0 })
    const half = animationStepDuration
    const stagger = half / Math.max(pixelNodes.length, 1)

    const timeline = gsap.timeline()
    timeline.to(pixelNodes, {
      opacity: 1,
      duration: 0,
      stagger: { each: stagger, from: 'random' },
    })
    timeline.set(first, { opacity: active ? 0 : 1 }, half)
    timeline.set(second, { opacity: active ? 1 : 0 }, half)
    timeline.to(pixelNodes, {
      opacity: 0,
      duration: 0,
      stagger: { each: stagger, from: 'random' },
    })

    return () => timeline.kill()
  }, [active, animationStepDuration, gridSize])

  return (
    <div className={`rb-pixel-transition ${className}`.trim()} data-active={active ? 'true' : 'false'}>
      <div ref={firstRef} className="rb-pixel-transition__layer rb-pixel-transition__layer--first" aria-hidden={active}>
        {firstContent}
      </div>
      <div ref={secondRef} className="rb-pixel-transition__layer rb-pixel-transition__layer--second" aria-hidden={!active}>
        {secondContent}
      </div>
      <div ref={gridRef} className="rb-pixel-transition__pixels" aria-hidden="true">
        {pixels.map((index) => (
          <span
            data-rb-pixel
            className="rb-pixel-transition__pixel"
            style={{ background: pixelColor }}
            key={index}
          />
        ))}
      </div>
    </div>
  )
}
