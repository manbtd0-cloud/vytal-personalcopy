import { useEffect, useMemo, useRef } from 'react'
import MediaFrame from './MediaFrame.jsx'
import { getMediaSlotById } from '../../content/mediaSlots.js'
import '../../styles/story-overlay.css'

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export default function StoryOverlay({ scenario, scenarios = [], onSelect, onClose }) {
  const dialogRef = useRef(null)
  const closeRef = useRef(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  const isOpen = Boolean(scenario)
  const currentIndex = useMemo(
    () => (scenario ? scenarios.findIndex((item) => item.id === scenario.id) : -1),
    [scenario, scenarios],
  )

  useEffect(() => {
    if (!isOpen) return undefined

    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current?.()
        return
      }

      if (event.key !== 'Tab' || !dialogRef.current) return

      const focusable = Array.from(dialogRef.current.querySelectorAll(FOCUSABLE_SELECTOR))
      if (focusable.length === 0) {
        event.preventDefault()
        dialogRef.current.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus?.()
    }
  }, [isOpen])

  if (!scenario) return null

  const previousIndex = currentIndex <= 0 ? scenarios.length - 1 : currentIndex - 1
  const nextIndex = currentIndex < 0 || currentIndex >= scenarios.length - 1 ? 0 : currentIndex + 1
  const previousScenario = scenarios[previousIndex]
  const nextScenario = scenarios[nextIndex]
  const mediaSlots = scenario.mediaSlotIds
    .map((id) => getMediaSlotById(id))
    .filter(Boolean)

  return (
    <div
      className="story-overlay"
      data-story-overlay="true"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.()
      }}
    >
      <section
        ref={dialogRef}
        className="story-overlay__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`story-overlay-title-${scenario.id}`}
        tabIndex={-1}
      >
        <header className="story-overlay__header">
          <p className="story-overlay__label">Illustrative scenario</p>
          <button ref={closeRef} type="button" className="story-overlay__close" onClick={onClose}>
            <span>Close story</span>
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className="story-overlay__copy">
          <p className="story-overlay__index">
            {String(currentIndex + 1).padStart(2, '0')} / {String(scenarios.length).padStart(2, '0')}
          </p>
          <h2 id={`story-overlay-title-${scenario.id}`}>{scenario.title}</h2>
          <p className="story-overlay__summary">{scenario.summary}</p>
          <p className="story-overlay__detail">{scenario.detail}</p>
        </div>

        <div className="story-overlay__media" aria-label={`${scenario.title} illustrative media placeholders`}>
          {mediaSlots.map((slot) => (
            <MediaFrame key={slot.id} slot={slot} className="story-overlay__frame" />
          ))}
        </div>

        <footer className="story-overlay__footer">
          <button
            type="button"
            onClick={() => previousScenario && onSelect?.(previousScenario.id)}
            aria-label="Previous story"
          >
            <span aria-hidden="true">←</span>
            <span>{previousScenario?.title ?? 'Previous'}</span>
          </button>
          <button
            type="button"
            onClick={() => nextScenario && onSelect?.(nextScenario.id)}
            aria-label="Next story"
          >
            <span>{nextScenario?.title ?? 'Next'}</span>
            <span aria-hidden="true">→</span>
          </button>
        </footer>
      </section>
    </div>
  )
}
