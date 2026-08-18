import { Link } from 'react-router-dom'
import SectionShell from '../SectionShell.jsx'
import { homeContent } from '../../content/home.js'

export default function ImpactSection() {
  const { impact } = homeContent

  return (
    <SectionShell tone="dark" className="home-impact-section">
      <div className="home-impact__grid">
        <div className="home-impact__copy">
          <p className="public-eyebrow">{impact.eyebrow}</p>
          <h2 className="landing-section-heading">{impact.title}</h2>
          <p>{impact.body}</p>
          <Link to="/impact" className="home-impact__link">
            {impact.cta}
            <span aria-hidden="true">↗</span>
          </Link>
        </div>

        <div className="home-impact__system">
          <div className="home-impact__hardware" aria-hidden="true">
            <div className="home-impact__phone">
              <span className="home-impact__camera" />
              <span className="home-impact__signal" />
              <span className="home-impact__signal" />
              <span className="home-impact__signal" />
            </div>
            <div className="home-impact__radius home-impact__radius--one" />
            <div className="home-impact__radius home-impact__radius--two" />
          </div>

          <div className="home-impact__items">
            {impact.items.map((item, index) => (
              <div key={item}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{item}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="health-worker-flow">
        <span className="health-worker-flow__label">COMMUNITY HEALTH WORKFLOW</span>
        <strong>{impact.flow}</strong>
        <span className="health-worker-flow__note">One portable screening flow, built around continuity rather than a disposable reading.</span>
      </div>
    </SectionShell>
  )
}
