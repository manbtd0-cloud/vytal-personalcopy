import { Link } from 'react-router-dom'
import MediaFrame from '../components/system/MediaFrame.jsx'
import SectionThemeBoundary from '../components/system/SectionThemeBoundary.jsx'
import SignalThread from '../components/system/SignalThread.jsx'
import { illustrativeJourney } from '../content/journey.js'
import { getMediaSlotById } from '../content/mediaSlots.js'
import { getSiteFacts, QUALITY_FACTORS } from '../content/siteFacts.js'
import '../styles/journey-case-study.css'

const heroSlot = getMediaSlotById('JRN-HERO-01')
const closeSlot = getMediaSlotById('JRN-CLOSE-01')

const themeByBeat = {
  context: 'media-dark',
  'low-confidence': 'coral',
  'signal-lock': 'light',
  'example-result': 'dark',
  explanation: 'light',
  history: 'media-dark',
  trend: 'coral',
}

function JourneyBeat({ beat }) {
  const slot = getMediaSlotById(beat.mediaSlotId)
  const isResult = beat.id === 'example-result'
  const isFailure = beat.id === 'low-confidence'
  const isTrend = beat.id === 'trend'

  return (
    <SectionThemeBoundary
      theme={themeByBeat[beat.id] ?? 'dark'}
      as="section"
      className={`journey-beat journey-beat--${beat.id}`}
      data-journey-beat={beat.id}
    >
      <div className="public-shell journey-beat__layout">
        <header className="journey-beat__header">
          <span aria-hidden="true">{beat.marker}</span>
          <p className="ref-kicker">{beat.kicker}</p>
          <h2>{beat.title}</h2>
          <p>{beat.body}</p>
        </header>

        {slot ? <MediaFrame slot={slot} className="journey-beat__media" /> : null}

        {isFailure ? (
          <div className="journey-beat__failure" aria-label="Low-confidence outcome">
            <span>LOW CONFIDENCE</span>
            <strong>Reading withheld</strong>
            <p>Retry after stabilising capture.</p>
          </div>
        ) : null}

        {isResult ? (
          <div className="journey-beat__example-result">
            <p className="journey-example-label">{beat.exampleLabel}</p>
            <div className="journey-beat__values">
              {beat.values.map((value) => (
                <div key={value.label}>
                  <span>{value.label}</span>
                  <strong>{value.value}</strong>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {isTrend ? (
          <div className="journey-beat__trend-label">
            <p className="journey-example-label">{beat.exampleLabel}</p>
            <span>Repeated records shown as a fictional demonstration only.</span>
          </div>
        ) : null}
      </div>
    </SectionThemeBoundary>
  )
}

export default function JourneyPage() {
  const facts = getSiteFacts()

  return (
    <main className="journey-page">
      <SectionThemeBoundary theme="media-dark" as="section" className="journey-hero">
        <SignalThread variant="raw" tone="coral" density="dense" className="journey-hero__signal" />
        <div className="public-shell journey-hero__layout">
          <div className="journey-hero__copy">
            <p className="journey-hero__disclaimer">{illustrativeJourney.label}</p>
            <p className="ref-kicker">JOURNEY / PRODUCT BEHAVIOUR</p>
            <h1>{illustrativeJourney.heroTitle}</h1>
            <p>{illustrativeJourney.heroBody}</p>
            <a href="#journey-story" className="journey-hero__cue">
              Follow the attempt <span aria-hidden="true">↓</span>
            </a>
          </div>
          {heroSlot ? <MediaFrame slot={heroSlot} className="journey-hero__media" /> : null}
        </div>
      </SectionThemeBoundary>

      <div id="journey-story" className="journey-story">
        {illustrativeJourney.beats.map((beat) => (
          <JourneyBeat beat={beat} key={beat.id} />
        ))}
      </div>

      <SectionThemeBoundary
        theme="light"
        as="section"
        className="journey-facts"
        data-journey-product-facts
      >
        <div className="public-shell journey-facts__layout">
          <div className="journey-facts__intro">
            <p className="ref-kicker">VERIFIED PRODUCT FACTS / NOT CASE OUTCOMES</p>
            <h2>Keep proof separate from the fictional walkthrough.</h2>
            <p>
              These values are derived from the current product content model. They describe the public prototype surface, not a patient, deployment or medical outcome.
            </p>
          </div>

          <div className="journey-facts__numbers">
            <article>
              <strong>{facts.coreScreeningCount}</strong>
              <p>{facts.coreScreeningCount} core camera-derived screening signals</p>
            </article>
            <article>
              <strong>{facts.languageCount}</strong>
              <p>{facts.languageCount} supported languages</p>
            </article>
            <article>
              <strong>{QUALITY_FACTORS.length}</strong>
              <p>{QUALITY_FACTORS.length} quality factors</p>
            </article>
          </div>
        </div>
      </SectionThemeBoundary>

      <SectionThemeBoundary
        theme="dark"
        as="section"
        className="journey-close"
        data-journey-close
      >
        <div className="public-shell journey-close__layout">
          <div className="journey-close__copy">
            <p className="ref-kicker">ENTRY / TRY THE CURRENT PRODUCT</p>
            <h2>See what the real scanner does with your signal.</h2>
            <p>Screening support, not diagnosis. Poor capture can correctly end in a retry instead of a reading.</p>
            <div className="journey-close__actions">
              <Link to="/scan">Start Screening</Link>
              <Link to="/screenings">Explore Screenings</Link>
            </div>
          </div>
          {closeSlot ? <MediaFrame slot={closeSlot} className="journey-close__media" /> : null}
        </div>
      </SectionThemeBoundary>
    </main>
  )
}
