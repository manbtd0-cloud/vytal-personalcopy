import MediaFrame from '../system/MediaFrame.jsx'
import NumberReveal from '../system/NumberReveal.jsx'
import SectionThemeBoundary from '../system/SectionThemeBoundary.jsx'
import SignalThread from '../system/SignalThread.jsx'
import { mediaSlots } from '../../content/mediaSlots.js'
import { getSiteFacts } from '../../content/siteFacts.js'
import { homeReference } from '../../content/homeReference.js'

export default function ProofFieldChapter() {
  const facts = getSiteFacts()
  const content = homeReference.proof
  const factItems = [
    {
      value: facts.coreScreeningCount,
      label: 'core physiological screening categories',
      source: 'SCREENINGS / CORE',
    },
    {
      value: facts.languageCount,
      label: 'supported explanation languages',
      source: 'SUPPORTED_LANGUAGES',
    },
    {
      value: facts.qualityFactorCount,
      label: 'quality factors treated as part of the reading',
      source: 'QUALITY / TRUST',
    },
  ]

  return (
    <SectionThemeBoundary
      theme="coral"
      as="section"
      className="ref-proof"
      data-home-chapter="proof"
    >
      <div className="public-shell ref-proof__intro">
        <p className="ref-kicker">{content.kicker}</p>
        <h2>{content.title}</h2>
        <p>{content.body}</p>
      </div>

      <div className="public-shell ref-proof__facts">
        {factItems.map((item) => (
          <article className="ref-proof__fact" key={item.label}>
            <p className="ref-proof__source">{item.source}</p>
            <NumberReveal value={item.value} className="ref-proof__number" />
            <p className="ref-proof__label">{item.label}</p>
          </article>
        ))}
      </div>

      <div className="ref-proof__field public-shell">
        <MediaFrame slot={mediaSlots.HOME_ACCESS_MAP_01} className="ref-proof__map" />
        <SignalThread variant="context" tone="ink" density="quiet" className="ref-proof__thread" />
        <p className="ref-proof__map-label">{content.mapLabel}</p>
      </div>
    </SectionThemeBoundary>
  )
}
