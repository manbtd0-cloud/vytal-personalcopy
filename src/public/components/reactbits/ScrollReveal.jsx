import { useEffect, useMemo, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import useReducedMotion from '../../hooks/useReducedMotion.js'

gsap.registerPlugin(ScrollTrigger)

export default function ScrollReveal({
  children,
  className = '',
  baseOpacity = 0.16,
  baseRotation = 2,
  blurStrength = 3,
  enableBlur = true,
  tag = 'div',
}) {
  const ref = useRef(null)
  const Tag = tag
  const reducedMotion = useReducedMotion()
  const words = useMemo(() => String(children).split(/(\s+)/), [children])

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined
    const wordNodes = node.querySelectorAll('[data-rb-reveal-word]')

    if (reducedMotion) {
      gsap.set(node, { rotate: 0 })
      gsap.set(wordNodes, { opacity: 1, filter: 'blur(0px)' })
      return undefined
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        node,
        { rotate: baseRotation, transformOrigin: '0% 50%' },
        {
          rotate: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: node,
            start: 'top 92%',
            end: 'bottom 65%',
            scrub: true,
          },
        },
      )

      gsap.fromTo(
        wordNodes,
        {
          opacity: baseOpacity,
          filter: enableBlur ? `blur(${blurStrength}px)` : 'blur(0px)',
        },
        {
          opacity: 1,
          filter: 'blur(0px)',
          ease: 'none',
          stagger: 0.035,
          scrollTrigger: {
            trigger: node,
            start: 'top 88%',
            end: 'bottom 58%',
            scrub: true,
          },
        },
      )
    }, node)

    return () => context.revert()
  }, [baseOpacity, baseRotation, blurStrength, enableBlur, reducedMotion])

  return (
    <Tag ref={ref} className={`rb-scroll-reveal ${className}`.trim()}>
      {words.map((word, index) => {
        if (/^\s+$/.test(word)) return word
        return (
          <span className="rb-scroll-reveal__word" data-rb-reveal-word key={`${word}-${index}`}>
            {word}
          </span>
        )
      })}
    </Tag>
  )
}
