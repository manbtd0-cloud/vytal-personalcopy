import SectionShell from '../SectionShell.jsx'
import ProcessCard from './ProcessCard.jsx'
import { homeContent } from '../../content/home.js'

export default function ProcessSection() {
  const { process } = homeContent

  return (
    <SectionShell tone="dark" className="process-section">
      <div className="process-section__grid">
        <div className="process-section__intro">
          <p className="public-eyebrow">{process.eyebrow}</p>
          <h2>From a camera frame to something worth explaining.</h2>
          <p>{process.intro}</p>
          <div className="process-section__rule" aria-hidden="true">
            <span>INPUT</span>
            <i />
            <span>CONTEXT</span>
          </div>
        </div>

        <div className="process-section__cards">
          {process.cards.map((card, index) => (
            <ProcessCard {...card} index={index} key={card.number} />
          ))}
        </div>
      </div>
    </SectionShell>
  )
}
