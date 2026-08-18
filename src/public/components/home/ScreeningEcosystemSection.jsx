import { Link } from 'react-router-dom'
import SectionShell from '../SectionShell.jsx'
import ScreeningTile from './ScreeningTile.jsx'
import { homeContent } from '../../content/home.js'
import { homeScreeningTiles } from '../../content/screenings.js'

export default function ScreeningEcosystemSection() {
  const { ecosystem } = homeContent

  return (
    <SectionShell tone="dark" className="screening-ecosystem-section">
      <div className="screening-ecosystem__header">
        <div>
          <p className="public-eyebrow">{ecosystem.eyebrow}</p>
          <h2 className="landing-section-heading">{ecosystem.title}</h2>
        </div>
        <div className="screening-ecosystem__intro">
          <p>{ecosystem.body}</p>
          <p className="screening-ecosystem__note">
            Maturity labels are part of the interface: core signals, research proxies and experimental pathways are not presented as equivalent.
          </p>
          <Link className="screening-ecosystem__link" to="/screenings">
            {ecosystem.cta}
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>

      <div className="screening-ecosystem__grid">
        {homeScreeningTiles.map((screening, index) => (
          <ScreeningTile screening={screening} index={index} key={screening.slug} />
        ))}
      </div>
    </SectionShell>
  )
}
