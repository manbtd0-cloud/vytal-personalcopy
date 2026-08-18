import { useEffect, useMemo, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function SplitText({
  text,
  className = '',
  delay = 45,
  duration = 0.9,
  ease = 'power3.out',
  splitType = 'words',
  from = { opacity: 0, y: 28 },
  to = { opacity: 1, y: 0 },
  threshold = 0.12,
  tag = 'span',
  animateOnMount = false,
  onAnimationComplete,
}) {
  const ref = useRef(null)
  const Tag = tag

  const pieces = useMemo(() => {
    if (splitType === 'chars') return Array.from(text)
    return text.split(/(\s+)/)
  }, [splitType, text])

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined
    const targets = node.querySelectorAll('[data-rb-split-piece]')
    const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduce) {
      gsap.set(targets, { opacity: 1, y: 0, clearProps: 'willChange' })
      onAnimationComplete?.()
      return undefined
    }

    const tween = gsap.fromTo(
      targets,
      { ...from, willChange: 'transform, opacity' },
      {
        ...to,
        duration,
        ease,
        stagger: delay / 1000,
        clearProps: 'willChange',
        scrollTrigger: animateOnMount
          ? undefined
          : {
              trigger: node,
              start: `top ${(1 - threshold) * 100}%`,
              once: true,
            },
        onComplete: onAnimationComplete,
      },
    )

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [animateOnMount, delay, duration, ease, from, onAnimationComplete, threshold, to])

  return (
    <Tag ref={ref} className={`rb-split-text ${className}`.trim()} aria-label={text}>
      {pieces.map((piece, index) => {
        if (/^\s+$/.test(piece)) return piece
        return (
          <span data-rb-split-piece aria-hidden="true" className="rb-split-text__piece" key={`${piece}-${index}`}>
            {piece}
          </span>
        )
      })}
    </Tag>
  )
}
