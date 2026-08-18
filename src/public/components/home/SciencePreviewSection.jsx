import { Link } from 'react-router-dom'
import SectionShell from '../SectionShell.jsx'
import { homeContent } from '../../content/home.js'

export default function SciencePreviewSection() {
  const { science } = homeContent

  return (
    <SectionShell tone="raised" className="science-preview-section">
      <div className="science-preview__header">
        <p className="public-eyebrow">{science.eyebrow}</p>
        <h2 className="landing-section-heading">{science.title}</h2>
        <p>{science.body}</p>
      </div>

      <div className="science-preview__index">
        {science.pillars.map((pillar, index) => (
          <article key={pillar}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <h3>{pillar}</h3>
            <i aria-hidden="true" />
          </article>
        ))}
      </div>

      <Link to="/science" className="science-preview__link">
        {science.cta}
        <span aria-hidden="true">↗</span>
      </Link>
    </SectionShell>
  )
}
