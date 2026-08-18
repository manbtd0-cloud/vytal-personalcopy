import { Link } from 'react-router-dom'
import Magnet from '../reactbits/Magnet.jsx'
import { homeContent } from '../../content/home.js'

export default function FinalCtaSection() {
  const { finalCta } = homeContent

  return (
    <section className="final-cta-section" aria-label="Final call to action">
      <div className="final-cta__field" aria-hidden="true">
        <span className="final-cta__orb final-cta__orb--coral" />
        <span className="final-cta__orb final-cta__orb--mint" />
        <span className="final-cta__scan" />
      </div>

      <div className="public-shell final-cta__inner">
        <div className="final-cta__topline" aria-hidden="true">
          <span>VYTAL / ENTRY</span>
          <span>SCREENING EXPERIENCE</span>
        </div>

        <h2>{finalCta.title}</h2>
        <p className="final-cta__body">{finalCta.body}</p>

        <div className="final-cta__actions">
          <Magnet padding={42} magnetStrength={7}>
            <Link className="public-button public-button--primary final-cta__primary" to="/scan">
              {finalCta.primary}
              <span aria-hidden="true">↗</span>
            </Link>
          </Magnet>
          <Link className="public-button public-button--secondary final-cta__secondary" to="/screenings">
            {finalCta.secondary}
          </Link>
        </div>

        <div className="final-cta__disclaimer">
          <span>MEDICAL CONTEXT</span>
          <p>{finalCta.disclaimer}</p>
        </div>
      </div>
    </section>
  )
}
