import { useEffect, useRef } from 'react'
import useReducedMotion from '../../hooks/useReducedMotion.js'

function frameStatus(slot, mediaSrc) {
  if (!mediaSrc) return 'placeholder'
  return slot.status === 'placeholder' ? 'candidate' : slot.status
}

export default function MediaFrame({
  slot,
  src,
  poster,
  alt,
  className = '',
  children,
}) {
  const reducedMotion = useReducedMotion()
  const videoRef = useRef(null)
  const mediaSrc = src ?? slot.src
  const mediaPoster = poster ?? slot.poster
  const mediaAlt = alt ?? slot.alt ?? ''
  const isViewport = slot.ratio === 'viewport'
  const parallaxEnabled = Boolean(slot.parallax && !reducedMotion)
  const status = frameStatus(slot, mediaSrc)
  const classes = [
    'media-frame',
    `media-frame--${slot.kind}`,
    `media-frame--reveal-${slot.reveal}`,
    isViewport ? 'media-frame--viewport' : '',
    className,
  ].filter(Boolean).join(' ')

  useEffect(() => {
    const video = videoRef.current
    if (!video || slot.kind !== 'video' || !mediaSrc) return undefined

    const pause = () => video.pause()
    const play = () => {
      if (reducedMotion) {
        pause()
        return
      }

      const result = video.play()
      result?.catch?.(() => {})
    }

    if (reducedMotion) {
      pause()
      return pause
    }

    if (typeof IntersectionObserver !== 'function') {
      play()
      return pause
    }

    const observer = new IntersectionObserver((entries) => {
      const entry = entries.find((candidate) => candidate.target === video) ?? entries[0]
      if (entry?.isIntersecting) play()
      else pause()
    }, { threshold: 0.15 })

    observer.observe(video)

    return () => {
      observer.disconnect()
      pause()
    }
  }, [mediaSrc, reducedMotion, slot.kind])

  return (
    <figure
      className={classes}
      data-media-slot={slot.id}
      data-media-status={status}
      data-media-kind={slot.kind}
      data-media-ratio={slot.ratio}
      data-media-parallax={parallaxEnabled ? 'enabled' : 'disabled'}
      style={{
        aspectRatio: isViewport ? undefined : slot.ratio,
        '--media-position': slot.objectPosition,
      }}
    >
      <div className="media-frame__surface">
        {slot.kind === 'video' && mediaSrc ? (
          <video
            ref={videoRef}
            src={mediaSrc}
            poster={mediaPoster || undefined}
            muted
            playsInline
            loop={!reducedMotion}
            preload={slot.priority === 'high' ? 'metadata' : 'none'}
            aria-label={mediaAlt || undefined}
          />
        ) : mediaSrc ? (
          <img
            src={mediaSrc}
            alt={mediaAlt}
            loading={slot.priority === 'high' ? 'eager' : 'lazy'}
            decoding="async"
          />
        ) : (
          <div className="media-frame__placeholder" aria-hidden="true">
            {import.meta.env.DEV ? <span>{slot.id}</span> : null}
          </div>
        )}
        {children}
      </div>
      {slot.caption ? <figcaption className="media-frame__caption">{slot.caption}</figcaption> : null}
    </figure>
  )
}
