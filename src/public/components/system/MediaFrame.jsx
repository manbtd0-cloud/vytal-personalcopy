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
            src={mediaSrc}
            poster={mediaPoster || undefined}
            muted
            playsInline
            autoPlay={!reducedMotion}
            loop={!reducedMotion}
            preload={slot.priority === 'high' ? 'metadata' : 'none'}
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
