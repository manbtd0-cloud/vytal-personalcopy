import { useEffect, useRef, useState } from 'react'

export default function Magnet({
  children,
  padding = 48,
  disabled = false,
  magnetStrength = 5,
  wrapperClassName = '',
  innerClassName = '',
  ...props
}) {
  const ref = useRef(null)
  const [active, setActive] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const reduce = typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null
    const coarse = typeof window.matchMedia === 'function'
      ? window.matchMedia('(pointer: coarse)')
      : null

    const shouldDisable = () => disabled || reduce?.matches || coarse?.matches

    const reset = () => {
      setActive(false)
      setPosition({ x: 0, y: 0 })
    }

    const handlePointerMove = (event) => {
      const node = ref.current
      if (!node || shouldDisable()) {
        reset()
        return
      }

      const rect = node.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const distX = Math.abs(centerX - event.clientX)
      const distY = Math.abs(centerY - event.clientY)
      const withinX = distX < rect.width / 2 + padding
      const withinY = distY < rect.height / 2 + padding

      if (!withinX || !withinY) {
        reset()
        return
      }

      setActive(true)
      setPosition({
        x: (event.clientX - centerX) / magnetStrength,
        y: (event.clientY - centerY) / magnetStrength,
      })
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    reduce?.addEventListener?.('change', reset)
    coarse?.addEventListener?.('change', reset)

    if (shouldDisable()) reset()

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      reduce?.removeEventListener?.('change', reset)
      coarse?.removeEventListener?.('change', reset)
    }
  }, [disabled, magnetStrength, padding])

  return (
    <span ref={ref} className={`rb-magnet ${wrapperClassName}`.trim()} {...props}>
      <span
        className={`rb-magnet__inner ${innerClassName}`.trim()}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          transition: active ? 'transform 180ms var(--public-ease)' : 'transform 360ms var(--public-ease)',
        }}
      >
        {children}
      </span>
    </span>
  )
}
