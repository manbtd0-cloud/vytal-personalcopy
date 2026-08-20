import { Link } from 'react-router-dom'
import IndicatorTray from '../components/screenings/IndicatorTray.jsx'
import ScreeningSpine from '../components/screenings/ScreeningSpine.jsx'
import MediaFrame from '../components/system/MediaFrame.jsx'
import SectionThemeBoundary from '../components/system/SectionThemeBoundary.jsx'
import SignalThread from '../components/system/SignalThread.jsx'
import { getMediaSlotById } from '../content/mediaSlots.js'
import '../styles/screenings-atlas.css'

const truthLines = [
  'Camera oxygen proxy is not a clinical pulse oximeter.',
  'Rhythm screening is not an ECG diagnosis.',
  'Anemia and jaundice indicators are not lab measurements.',
  'Blood-pressure trends are not a cuff replacement.',
  'Future hardware is not a current production integration.',
]

export default function ScreeningsPage() {
  const heroSlot = getMediaSlotById('SCR-HERO-01')

  return (
    <main className="screenings-page">
      <SectionThemeBoundary theme="media-dark" as="section" className="screenings-hero">
        {heroSlot ? <MediaFrame slot={heroSlot} className="screenings-hero__media" /> : null}
        <div className="screenings-hero__scrim" aria-hidden="true" />
        <SignalThread variant="lock" tone="mint" density="dense" className="screenings-hero__signal" />
        <div className="public-shell screenings-hero__inner">
          <p className="ref-kicker">SCREENINGS / CAPABILITY ATLAS</p>
          <h1>What Vytal is designed to screen</h1>
          <p>
            The atlas separates current physiological signals, research proxies, context layers and future integrations by maturity instead of presenting every capability as equivalent.
          </p>
          <a href="#screening-core-physiological" className="screenings-hero__cue">Enter the atlas <span aria-hidden="true">↓</span></a>
        </div>
      </SectionThemeBoundary>

      <IndicatorTray />
      <ScreeningSpine />

      <SectionThemeBoundary
        theme="light"
        as="section"
        className="screening-truth"
        data-screening-truth="true"
      >
        <div className="public-shell screening-truth__inner">
          <p className="ref-kicker">BOUNDARIES / WHAT WE DO NOT CLAIM</p>
          <h2>Different signals require different levels of evidence.</h2>
          <div className="screening-truth__lines">
            {truthLines.map((line, index) => (
              <p key={line}><span>{String(index + 1).padStart(2, '0')}</span>{line}</p>
            ))}
          </div>
        </div>
      </SectionThemeBoundary>

      <SectionThemeBoundary theme="dark" as="section" className="screenings-entry">
        <div className="public-shell screenings-entry__inner">
          <p className="ref-kicker">NEXT / PRODUCT OR EVIDENCE</p>
          <h2>Ready to try the current screening experience?</h2>
          <div className="screenings-entry__actions">
            <Link to="/scan">Start Screening</Link>
            <Link to="/science">Explore the Science</Link>
          </div>
          <p>Screening support, not diagnosis.</p>
        </div>
      </SectionThemeBoundary>
    </main>
  )
}
