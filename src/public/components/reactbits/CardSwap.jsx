import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { gsap } from 'gsap'
import useReducedMotion from '../../hooks/useReducedMotion.js'

export const Card = forwardRef(function Card({ className = '', ...props }, ref) {
  return <article ref={ref} className={`rb-swap-card ${className}`.trim()} {...props} />
})

function slotFor(index, distanceX, distanceY, total) {
  return {
    x: index * distanceX,
    y: -index * distanceY,
    z: -index * distanceX * 1.25,
    zIndex: total - index,
  }
}

function place(node, slot, skew) {
  gsap.set(node, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    zIndex: slot.zIndex,
    transformOrigin: 'center center',
    force3D: true,
  })
}

export default function CardSwap({
  width = 460,
  height = 330,
  cardDistance = 42,
  verticalDistance = 44,
  delay = 4200,
  pauseOnHover = true,
  skewAmount = 3,
  children,
}) {
  const childArray = useMemo(() => Children.toArray(children), [children])
  const refs = useMemo(() => childArray.map(() => ({ current: null })), [childArray.length])
  const order = useRef(Array.from({ length: childArray.length }, (_, index) => index))
  const timelineRef = useRef(null)
  const intervalRef = useRef(null)
  const containerRef = useRef(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion || refs.length < 2) return undefined

    refs.forEach((item, index) => {
      if (item.current) place(item.current, slotFor(index, cardDistance, verticalDistance, refs.length), skewAmount)
    })

    const swap = () => {
      const [front, ...rest] = order.current
      const frontNode = refs[front]?.current
      if (!frontNode) return

      timelineRef.current?.kill()
      const timeline = gsap.timeline()
      timelineRef.current = timeline
      timeline.to(frontNode, { y: '+=360', opacity: 0.72, duration: 0.62, ease: 'power2.in' })
      timeline.addLabel('promote', '-=0.28')

      rest.forEach((index, position) => {
        const node = refs[index]?.current
        if (!node) return
        const target = slotFor(position, cardDistance, verticalDistance, refs.length)
        timeline.set(node, { zIndex: target.zIndex }, 'promote')
        timeline.to(
          node,
          { x: target.x, y: target.y, z: target.z, duration: 0.72, ease: 'power3.inOut' },
          `promote+=${position * 0.08}`,
        )
      })

      const back = slotFor(refs.length - 1, cardDistance, verticalDistance, refs.length)
      timeline.set(frontNode, { zIndex: back.zIndex })
      timeline.to(frontNode, {
        x: back.x,
        y: back.y,
        z: back.z,
        opacity: 1,
        duration: 0.76,
        ease: 'power3.out',
      })
      timeline.call(() => {
        order.current = [...rest, front]
      })
    }

    intervalRef.current = window.setInterval(swap, delay)
    const node = containerRef.current

    const pause = () => {
      timelineRef.current?.pause()
      window.clearInterval(intervalRef.current)
    }
    const resume = () => {
      timelineRef.current?.play()
      window.clearInterval(intervalRef.current)
      intervalRef.current = window.setInterval(swap, delay)
    }

    if (pauseOnHover && node) {
      node.addEventListener('pointerenter', pause)
      node.addEventListener('pointerleave', resume)
    }

    return () => {
      timelineRef.current?.kill()
      window.clearInterval(intervalRef.current)
      if (pauseOnHover && node) {
        node.removeEventListener('pointerenter', pause)
        node.removeEventListener('pointerleave', resume)
      }
    }
  }, [cardDistance, delay, pauseOnHover, reducedMotion, refs, skewAmount, verticalDistance])

  const rendered = childArray.map((child, index) => {
    if (!isValidElement(child)) return child
    return cloneElement(child, {
      key: child.key ?? index,
      ref: (node) => {
        refs[index].current = node
      },
      style: { width, height, ...(child.props.style ?? {}) },
    })
  })

  return (
    <div
      ref={containerRef}
      className="rb-card-swap"
      style={{ '--rb-card-swap-width': `${width}px`, '--rb-card-swap-height': `${height}px` }}
    >
      {rendered}
    </div>
  )
}
