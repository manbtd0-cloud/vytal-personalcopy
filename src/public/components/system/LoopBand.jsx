import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import useReducedMotion from '../../hooks/useReducedMotion.js'
import VisuallyHiddenList from './VisuallyHiddenList.jsx'

export default function LoopBand({
  items = [],
  direction = 'left',
  speed = 0.8,
  ariaLabel = 'Moving content',
  renderItem = (item) => item,
  getKey,
  className = '',
}) {
  const trackRef = useRef(null)
  const segmentRef = useRef(null)
  const reducedMotion = useReducedMotion()

  useLayoutEffect(() => {
    const track = trackRef.current
    const segment = segmentRef.current
    if (!track || !segment) return undefined

    let tween

    const setup = () => {
      tween?.kill()
      gsap.set(track, { x: 0 })

      if (reducedMotion) return
      const width = segment.getBoundingClientRect().width || segment.scrollWidth
      if (!width) return

      const pixelsPerSecond = Math.max(18, 76 * Math.max(speed, 0.1))
      const duration = Math.max(6, width / pixelsPerSecond)

      if (direction === 'right') {
        gsap.set(track, { x: -width })
        tween = gsap.to(track, { x: 0, duration, ease: 'none', repeat: -1 })
      } else {
        tween = gsap.to(track, { x: -width, duration, ease: 'none', repeat: -1 })
      }
    }

    setup()

    const observer = typeof ResizeObserver === 'function'
      ? new ResizeObserver(setup)
      : null
    observer?.observe(segment)

    return () => {
      observer?.disconnect()
      tween?.kill()
      gsap.killTweensOf(track)
    }
  }, [direction, reducedMotion, speed, items])

  const renderSegment = (copy) => (
    <div
      ref={copy === 0 ? segmentRef : undefined}
      className="loop-band__segment"
      data-loop-segment={copy}
    >
      {items.map((item, index) => (
        <span
          className="loop-band__item"
          key={`${copy}-${getKey ? getKey(item, index) : item?.id ?? item?.slug ?? index}`}
        >
          {renderItem(item, index)}
        </span>
      ))}
    </div>
  )

  return (
    <div className={`loop-band ${reducedMotion ? 'is-static' : ''} ${className}`.trim()} data-loop-band>
      <VisuallyHiddenList items={items} ariaLabel={ariaLabel} renderItem={renderItem} getKey={getKey} />
      <div className="loop-band__viewport" data-loop-band-visual aria-hidden="true">
        <div ref={trackRef} className="loop-band__track">
          {renderSegment(0)}
          {reducedMotion ? null : renderSegment(1)}
        </div>
      </div>
    </div>
  )
}
