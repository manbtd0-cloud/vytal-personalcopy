import { Link } from 'react-router-dom'
import SectionThemeBoundary from '../system/SectionThemeBoundary.jsx'
import SignalThread from '../system/SignalThread.jsx'

export default function FinalEntryChapter() {
  return (
    <SectionThemeBoundary
      theme="media-dark"
      as="section"
      className="ref-final-entry"
      data-home-chapter="final-entry"
    >
      <SignalThread
        variant="trusted"
        tone="mint"
        density="dense"
        className="ref-final-entry__signal"
      />

      <div className="public-shell ref-final-entry__inner">
        <p className="ref-kicker">ENTER / VYTAL</p>
        <h2>See what your camera can tell you.</h2>
        <p className="ref-final-entry__body">
          Start with a camera-based screening flow, then keep the result in the context of signal quality, explanation and follow-up.
        </p>

        <div className="ref-final-entry__actions">
          <Link to="/scan" className="ref-final-entry__primary">Start Screening</Link>
          <Link to="/screenings" className="ref-final-entry__secondary">Explore Screenings</Link>
        </div>

        <p className="ref-final-entry__disclaimer">Screening support, not diagnosis.</p>
      </div>
    </SectionThemeBoundary>
  )
}
