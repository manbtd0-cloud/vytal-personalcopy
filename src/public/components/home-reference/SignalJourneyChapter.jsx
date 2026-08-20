import MediaFrame from '../system/MediaFrame.jsx'
import RoiFrame from '../system/RoiFrame.jsx'
import SectionThemeBoundary from '../system/SectionThemeBoundary.jsx'
import SignalThread from '../system/SignalThread.jsx'
import { mediaSlots } from '../../content/mediaSlots.js'
import { QUALITY_FACTORS } from '../../content/siteFacts.js'

const beats = [
  {
    id: 'capture',
    number: '01',
    title: 'CAPTURE',
    body: 'The camera starts with reflected light from a visible region. Positioning and visibility come before any physiological interpretation.',
    slot: mediaSlots.HOME_JOURNEY_CAPTURE_01,
    variant: 'raw',
    tone: 'coral',
  },
  {
    id: 'extract',
    number: '02',
    title: 'EXTRACT',
    body: 'Tiny optical variation is separated from the frame into a signal that can be processed over time.',
    slot: mediaSlots.HOME_JOURNEY_EXTRACT_01,
    variant: 'lock',
    tone: 'mint',
  },
  {
    id: 'verify',
    number: '03',
    title: 'VERIFY',
    body: 'A reading is only useful when the input is usable. Vytal checks the conditions around the signal before presenting screening context.',
    slot: mediaSlots.HOME_JOURNEY_VERIFY_01,
    variant: 'trusted',
    tone: 'amber',
  },
  {
    id: 'explain',
    number: '04',
    title: 'EXPLAIN',
    body: 'The measurement layer comes first. Explanation then turns the result into clearer language without inventing the underlying reading.',
    slot: mediaSlots.HOME_JOURNEY_EXPLAIN_01,
    variant: 'context',
    tone: 'mint',
  },
]

function JourneyBeat({ beat }) {
  return (
    <article className={`ref-journey-beat ref-journey-beat--${beat.id}`} data-signal-beat={beat.id}>
      <div className="ref-journey-beat__meta">
        <span>{beat.number}</span>
        <h3>{beat.title}</h3>
      </div>

      <div className="ref-journey-beat__visual">
        <MediaFrame slot={beat.slot} className="ref-journey-beat__media" />
        <SignalThread
          variant={beat.variant}
          tone={beat.tone}
          density={beat.id === 'capture' ? 'dense' : 'default'}
          className="ref-journey-beat__thread"
        />
        {beat.id === 'capture' ? (
          <RoiFrame state="scan" label="ROI / optical input" className="ref-journey-beat__roi" />
        ) : null}
      </div>

      <div className="ref-journey-beat__copy">
        <p>{beat.body}</p>
        {beat.id === 'verify' ? (
          <ul className="ref-journey-beat__quality" aria-label="Signal quality factors">
            {QUALITY_FACTORS.map((factor) => (
              <li key={factor}>{factor}</li>
            ))}
          </ul>
        ) : null}
        {beat.id === 'explain' ? (
          <p className="ref-journey-beat__principle">AI explains the measurements. It doesn’t invent them.</p>
        ) : null}
      </div>
    </article>
  )
}

export default function SignalJourneyChapter() {
  return (
    <SectionThemeBoundary
      theme="dark"
      as="section"
      className="ref-signal-journey"
      data-home-chapter="signal-journey"
    >
      <div className="public-shell ref-signal-journey__intro">
        <p className="ref-kicker">SIGNAL / JOURNEY</p>
        <h2>Observe. Extract. Verify. Explain.</h2>
        <p>
          The product is not one magic camera moment. It is a chain of decisions about what the camera saw, how usable the signal is and what can responsibly be said next.
        </p>
      </div>

      <div className="ref-signal-journey__beats">
        {beats.map((beat) => (
          <JourneyBeat key={beat.id} beat={beat} />
        ))}
      </div>
    </SectionThemeBoundary>
  )
}
