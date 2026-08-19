import { useEffect, useMemo, useRef } from 'react'
import { gsap } from 'gsap'
import useReducedMotion from '../../hooks/useReducedMotion.js'

export default function NumberReveal({
  value,
  from = 0,
  duration = 1.15,
  prefix = '',
  suffix = '',
  formatter,
  className = '',
}) {
  const visualRef = useRef(null)
  const rootRef = useRef(null)
  const reducedMotion = useReducedMotion()

  const format = useMemo(() => {
    if (formatter) return formatter
    return (number) => Number.isInteger(value)
      ? Math.round(number).toLocaleString('en-US')
      : Number(number).toLocaleString('en-US', { maximumFractionDigits: 2 })
  }, [formatter, value])

  const finalText = `${prefix}${format(value)}${suffix}`

  useEffect(() => {
    const root = rootRef.current
    const visual = visualRef.current
    if (!root || !visual) return undefined

    const showFinal = () => {
      visual.textContent = finalText
    }

    if (reducedMotion) {
      showFinal()
      return undefined
    }

    let tween
    let observer
    let hasStarted = false

    const start = () => {
      if (hasStarted) return
      hasStarted = true
      const model = { value: from }
      visual.textContent = `${prefix}${format(from)}${suffix}`
      tween = gsap.to(model, {
        value,
        duration,
        ease: 'power2.out',
        onUpdate: () => {
          visual.textContent = `${prefix}${format(model.value)}${suffix}`
        },
        onComplete: showFinal,
      })
    }

    if (typeof IntersectionObserver === 'function') {
      observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          start()
          observer?.disconnect()
        }
      }, { threshold: 0.2 })
      observer.observe(root)
    } else {
      start()
    }

    return () => {
      observer?.disconnect()
      tween?.kill()
    }
  }, [duration, finalText, format, from, prefix, reducedMotion, suffix, value])

  return (
    <span
      ref={rootRef}
      className={`number-reveal ${className}`.trim()}
      data-number-reveal
      data-number-final={String(value)}
      aria-label={finalText}
    >
      <span className="visually-hidden-list">{finalText}</span>
      <span ref={visualRef} className="number-reveal__visual" aria-hidden="true">{finalText}</span>
    </span>
  )
}
