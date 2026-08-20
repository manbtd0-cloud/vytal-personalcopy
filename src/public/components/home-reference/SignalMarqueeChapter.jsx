import LoopBand from '../system/LoopBand.jsx'
import SectionThemeBoundary from '../system/SectionThemeBoundary.jsx'
import SignalThread from '../system/SignalThread.jsx'
import { homeSignalBandItems } from '../../content/homeReference.js'

function SignalBandItem({ item }) {
  return (
    <span
      className={`ref-signal-band__item ${item.isResearch ? 'is-research' : 'is-core'}`}
      data-signal-band-status={item.status}
    >
      <span className="ref-signal-band__label">{item.label}</span>
      <span className="ref-signal-band__status">{item.status}</span>
    </span>
  )
}

export default function SignalMarqueeChapter() {
  return (
    <SectionThemeBoundary
      theme="coral"
      as="section"
      className="ref-signal-band"
      data-home-chapter="signal-band"
    >
      <div className="public-shell ref-signal-band__header">
        <p className="ref-kicker">SCREENING / BREADTH</p>
        <p>Current core signals and clearly marked research directions belong in the same system without pretending they have the same maturity.</p>
      </div>

      <div className="ref-signal-band__stage">
        <SignalThread variant="divider" tone="ink" density="quiet" className="ref-signal-band__thread" />
        <LoopBand
          items={homeSignalBandItems}
          speed={0.62}
          ariaLabel="Vytal screening areas and maturity"
          className="ref-signal-band__loop"
          getKey={(item) => item.id}
          renderItem={(item) => <SignalBandItem item={item} />}
        />
      </div>

      <div className="public-shell ref-signal-band__key">
        <span><i className="is-core" /> Core</span>
        <span><i className="is-research" /> Research / experimental</span>
      </div>
    </SectionThemeBoundary>
  )
}
