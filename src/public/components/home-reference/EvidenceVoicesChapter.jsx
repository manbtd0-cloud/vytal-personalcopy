import { Link } from 'react-router-dom'
import MediaFrame from '../system/MediaFrame.jsx'
import SectionThemeBoundary from '../system/SectionThemeBoundary.jsx'
import { getMediaSlotById } from '../../content/mediaSlots.js'
import { homeEvidenceItems } from '../../content/homeReference.js'

function EvidenceItem({ item, index }) {
  const slot = getMediaSlotById(item.mediaSlotId)

  return (
    <article
      className={`ref-evidence-item ref-evidence-item--${item.type} ref-evidence-item--${index + 1}`}
      data-evidence-type={item.type}
    >
      {slot ? <MediaFrame slot={slot} className="ref-evidence-item__media" /> : null}
      <div className="ref-evidence-item__copy">
        <p className="ref-evidence-item__label">{item.label}</p>

        {item.type === 'pending-voice' ? (
          <p className="ref-evidence-item__pending">
            No quote is published here until a real contributor is approved and attributed.
          </p>
        ) : (
          <p className="ref-evidence-item__body">{item.body}</p>
        )}

        {item.type === 'research-note' ? (
          <Link to="/science" className="ref-evidence-item__link">
            Review primary sources <span aria-hidden="true">↗</span>
          </Link>
        ) : null}
      </div>
    </article>
  )
}

export default function EvidenceVoicesChapter() {
  return (
    <SectionThemeBoundary
      theme="dark"
      as="section"
      className="ref-evidence"
      data-home-chapter="evidence"
    >
      <div className="public-shell ref-evidence__intro">
        <p className="ref-kicker">EVIDENCE / VOICES</p>
        <h2>Proof should be sourced. Voices should be real.</h2>
        <p>
          Until permissioned expert and health-worker contributions exist, their spaces stay visibly unfinished. Research evidence and Vytal’s own product principles are labelled separately.
        </p>
      </div>

      <div className="public-shell ref-evidence__grid">
        {homeEvidenceItems.map((item, index) => (
          <EvidenceItem item={item} index={index} key={item.id} />
        ))}
      </div>
    </SectionThemeBoundary>
  )
}
