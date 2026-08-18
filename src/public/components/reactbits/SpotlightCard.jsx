import { useRef } from 'react'

export default function SpotlightCard({
  children,
  className = '',
  spotlightColor = 'rgba(255, 77, 94, 0.16)',
  ...props
}) {
  const ref = useRef(null)

  const handlePointerMove = (event) => {
    const node = ref.current
    if (!node) return
    const rect = node.getBoundingClientRect()
    node.style.setProperty('--rb-spot-x', `${event.clientX - rect.left}px`)
    node.style.setProperty('--rb-spot-y', `${event.clientY - rect.top}px`)
    node.style.setProperty('--rb-spot-color', spotlightColor)
  }

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      className={`rb-spotlight-card ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  )
}
