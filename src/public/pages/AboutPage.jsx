import { Link } from 'react-router-dom'
import MediaFrame from '../components/system/MediaFrame.jsx'
import SectionThemeBoundary from '../components/system/SectionThemeBoundary.jsx'
import SignalThread from '../components/system/SignalThread.jsx'
import { aboutPrinciples } from '../content/about.js'
import { getMediaSlotById } from '../content/mediaSlots.js'
import '../styles/about-origin.css'

const heroSlot = getMediaSlotById('ABOUT-HERO-01')
const originSlot = getMediaSlotById('ABOUT-ORIGIN-01')
const teamSlots = [
  getMediaSlotById('ABOUT-TEAM-01'),
  getMediaSlotById('ABOUT-TEAM-02'),
].filter(Boolean)
const researchSlot = getMediaSlotById('ABOUT-RESEARCH-01')

export default function AboutPage() {
  return (
    <main className="about-page">
      <SectionThemeBoundary theme="light" as="section" className="about-hero">
        <div className="public-shell about-hero__layout">
          <div className="about-hero__copy">
            <p className="ref-kicker">ABOUT / WHY VYTAL</p>
            <h1>Make sophisticated screening easier to reach—and harder to overclaim.</h1>
            <p>
              Vytal is a camera-first health-screening project built around a simple constraint: useful early health information should become easier to access without pretending uncertainty has disappeared.
            </p>
          </div>
          {heroSlot ? <MediaFrame slot={heroSlot} className="about-hero__media" /> : null}
        </div>
      </SectionThemeBoundary>

      <SectionThemeBoundary
        theme="dark"
        as="section"
        className="about-origin"
        data-about-origin
      >
        <SignalThread variant="context" tone="coral" density="sparse" className="about-origin__signal" />
        <div className="public-shell about-origin__layout">
          <div className="about-origin__copy">
            <p className="ref-kicker">ORIGIN / ACCESS BEFORE SPECTACLE</p>
            <h2>The camera is not the product. Access is.</h2>
            <p>
              Vytal started from the gap between having a smartphone and having immediate access to equipment, understandable screening information, persistent records or a clear next step.
            </p>
            <p>
              The project explores how far ordinary camera hardware can responsibly support that first layer: capture a physiological signal, qualify its confidence, explain what it may mean, and preserve context for follow-up.
            </p>
          </div>
          {originSlot ? <MediaFrame slot={originSlot} className="about-origin__media" /> : null}
        </div>
      </SectionThemeBoundary>

      <SectionThemeBoundary
        theme="light"
        as="section"
        className="about-principles"
        data-about-principles
      >
        <div className="public-shell about-principles__intro">
          <p className="ref-kicker">PRINCIPLES / PRODUCT DISCIPLINE</p>
          <h2>Four rules shape the public promise.</h2>
        </div>

        <div className="public-shell about-principles__field">
          {aboutPrinciples.map((principle, index) => (
            <article
              className={`about-principle about-principle--${index + 1}`}
              data-about-principle={principle.id}
              data-weight={principle.weight}
              key={principle.id}
            >
              <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <h3>{principle.title}</h3>
              <p>{principle.body}</p>
            </article>
          ))}
        </div>
      </SectionThemeBoundary>

      <SectionThemeBoundary
        theme="media-dark"
        as="section"
        className="about-team"
        data-about-team
      >
        <div className="public-shell about-team__intro">
          <p className="ref-kicker">TEAM / REAL MATERIAL ONLY</p>
          <h2>No invented authority.</h2>
          <p>
            Real team portraits only. These production frames stay intentionally empty until owned or permissioned team material is available; no generated stand-ins, fake experts or fabricated quotes.
          </p>
        </div>
        <div className="public-shell about-team__frames">
          {teamSlots.map((slot) => (
            <MediaFrame slot={slot} className="about-team__frame" key={slot.id} />
          ))}
        </div>
      </SectionThemeBoundary>

      <SectionThemeBoundary
        theme="coral"
        as="section"
        className="about-research"
        data-about-research
      >
        <div className="public-shell about-research__layout">
          <div className="about-research__copy">
            <p className="ref-kicker">RESEARCH / EVIDENCE LINEAGE</p>
            <h2>Research informs the system. It does not erase the validation gap.</h2>
            <p>
              The public Science route separates peer-reviewed remote-physiology foundations from Vytal’s internal prototype milestone, research screening directions and current validation boundaries.
            </p>
            <Link to="/science" className="about-research__link">Explore the science <span aria-hidden="true">→</span></Link>
          </div>
          {researchSlot ? <MediaFrame slot={researchSlot} className="about-research__media" /> : null}
        </div>
      </SectionThemeBoundary>

      <SectionThemeBoundary theme="dark" as="section" className="about-status">
        <div className="public-shell about-status__layout">
          <div>
            <p className="ref-kicker">STATUS / CURRENT PROJECT</p>
            <h2>A prototype with a deliberately narrow medical promise.</h2>
            <p>
              Vytal is screening support, not diagnosis. Core camera-derived signals and broader research pathways sit at different maturity levels, and low-confidence input can correctly end in a retry instead of a number.
            </p>
          </div>
          <nav className="about-status__actions" aria-label="About next steps">
            <Link to="/screenings">Explore Screenings</Link>
            <Link to="/science">Read the Science</Link>
            <Link to="/scan">Start Screening</Link>
          </nav>
        </div>
      </SectionThemeBoundary>
    </main>
  )
}
