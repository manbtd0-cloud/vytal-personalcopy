import SectionThemeBoundary from '../system/SectionThemeBoundary.jsx'
import SignalThread from '../system/SignalThread.jsx'

const trustPaths = [
  {
    id: 'retry',
    label: 'MOVEMENT → SIGNAL LOST → RETRY',
    variant: 'raw',
    tone: 'amber',
    note: 'A low-confidence input should end in another attempt, not a confident-looking number.',
  },
  {
    id: 'context',
    label: 'STABLE INPUT → SIGNAL LOCK → SCREENING CONTEXT',
    variant: 'trusted',
    tone: 'mint',
    note: 'Only a usable signal moves forward into screening context and explanation.',
  },
]

export default function TrustResetChapter() {
  return (
    <SectionThemeBoundary
      theme="light"
      as="section"
      className="ref-trust-reset"
      data-home-chapter="trust-reset"
    >
      <div className="public-shell ref-trust-reset__intro">
        <p className="ref-kicker">UNCERTAINTY / TRUST</p>
        <h2>Sometimes the right result is no result.</h2>
        <p>
          Motion, lighting and signal quality can make a camera reading unreliable. Vytal’s interface should be willing to stop, explain why and ask for a better attempt.
        </p>
      </div>

      <div className="public-shell ref-trust-reset__paths">
        {trustPaths.map((path) => (
          <article className={`ref-trust-path ref-trust-path--${path.id}`} key={path.id}>
            <div className="ref-trust-path__signal">
              <SignalThread variant={path.variant} tone={path.tone} density="quiet" />
            </div>
            <div className="ref-trust-path__copy">
              <h3>{path.label}</h3>
              <p>{path.note}</p>
            </div>
          </article>
        ))}
      </div>
    </SectionThemeBoundary>
  )
}
