import { Link } from 'react-router-dom'
import MediaFrame from '../components/system/MediaFrame.jsx'
import SectionThemeBoundary from '../components/system/SectionThemeBoundary.jsx'
import SignalThread from '../components/system/SignalThread.jsx'
import { platformFragments } from '../content/platform.js'
import { getMediaSlotById } from '../content/mediaSlots.js'
import '../styles/platform-context.css'

const assembledSlot = getMediaSlotById('PLT-ASSEMBLED-01')

function PlatformFragment({ fragment, index }) {
  const slot = getMediaSlotById(fragment.mediaSlotId)

  return (
    <article
      className={`platform-fragment platform-fragment--${index + 1}`}
      data-platform-fragment={fragment.id}
      data-platform-status={fragment.status}
    >
      <header className="platform-fragment__header">
        <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
        <p>{fragment.status}</p>
      </header>
      <h2>{fragment.title}</h2>
      <p className="platform-fragment__body">{fragment.body}</p>
      {slot ? <MediaFrame slot={slot} className="platform-fragment__media" /> : null}
    </article>
  )
}

export default function PlatformPage() {
  return (
    <main className="platform-page">
      <SectionThemeBoundary theme="dark" as="section" className="platform-hero">
        <SignalThread variant="context" tone="coral" density="sparse" className="platform-hero__signal" />
        <div className="public-shell platform-hero__inner">
          <p className="ref-kicker">PLATFORM / FRAGMENTS TO CONTEXT</p>
          <h1>One signal is a fragment.</h1>
          <p className="platform-hero__body">
            Vytal’s platform direction is not to pretend every sensing idea already exists. It is to connect current camera screening, confidence, explanation and records with clearly labelled future inputs as they mature.
          </p>
          <a href="#platform-fragments" className="platform-hero__cue">
            Follow the fragments <span aria-hidden="true">↓</span>
          </a>
        </div>
      </SectionThemeBoundary>

      <SectionThemeBoundary
        theme="light"
        as="section"
        className="platform-fragments"
        data-platform-fragments
        id="platform-fragments"
      >
        <div className="public-shell platform-fragments__intro">
          <p className="ref-kicker">EIGHT PIECES / DIFFERENT MATURITY</p>
          <h2>Not everything belongs in the same box.</h2>
          <p>
            Each fragment keeps its present status attached. Current capability, prototype direction, workflow direction and future research are intentionally not flattened into one feature list.
          </p>
        </div>
        <div className="public-shell platform-fragments__field">
          {platformFragments.map((fragment, index) => (
            <PlatformFragment fragment={fragment} index={index} key={fragment.id} />
          ))}
        </div>
      </SectionThemeBoundary>

      <SectionThemeBoundary
        theme="media-dark"
        as="section"
        className="platform-assembly"
        data-platform-assembly
      >
        <SignalThread
          variant="network"
          tone="mint"
          density="dense"
          className="platform-assembly__network"
        />
        <div className="public-shell platform-assembly__inner">
          <header className="platform-assembly__copy">
            <p className="ref-kicker">ASSEMBLY / CONTEXT GROWS</p>
            <h2>The value is in what connects.</h2>
            <p>
              A camera signal can become more useful when confidence, understandable explanation, history and handoff remain attached. Future sensors belong in that same context only when their maturity supports it.
            </p>
          </header>

          <div className="platform-assembly__labels" aria-label="Platform fragments">
            {platformFragments.map((fragment) => (
              <span data-platform-assembly-label={fragment.id} key={fragment.id}>
                {fragment.shortLabel}
              </span>
            ))}
          </div>

          {assembledSlot ? (
            <MediaFrame slot={assembledSlot} className="platform-assembly__media" />
          ) : null}
        </div>
      </SectionThemeBoundary>

      <SectionThemeBoundary
        theme="coral"
        as="section"
        className="platform-future-notice"
        data-platform-future-notice
      >
        <div className="public-shell platform-future-notice__inner">
          <p className="ref-kicker">BOUNDARY / CURRENT VS NEXT</p>
          <h2>Future integrations are not current production support.</h2>
          <div className="platform-future-notice__copy">
            <p>Camera remains the current core direction.</p>
            <p>
              BLE devices, wearables and thermal sensing are presented as future or research directions. Population-level pattern detection is also research direction, not a deployed health-surveillance claim.
            </p>
          </div>
        </div>
      </SectionThemeBoundary>

      <SectionThemeBoundary
        theme="dark"
        as="section"
        className="platform-close"
        data-platform-close
      >
        <div className="public-shell platform-close__inner">
          <p className="ref-kicker">ENTRY / CURRENT EXPERIENCE</p>
          <h2>Start with the signal Vytal is built around now.</h2>
          <p>
            Try the camera-first screening experience, or inspect the maturity and limitations of each screening path before entering the product.
          </p>
          <div className="platform-close__actions">
            <Link to="/scan">Start Screening</Link>
            <Link to="/screenings">Explore Screenings</Link>
          </div>
        </div>
      </SectionThemeBoundary>
    </main>
  )
}
