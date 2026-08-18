import SectionShell from '../SectionShell.jsx'
import { homeContent } from '../../content/home.js'

export default function TrustSection() {
  const { trust } = homeContent

  return (
    <SectionShell tone="ivory" className="trust-section">
      <div className="trust-section__header">
        <p className="public-eyebrow">{trust.eyebrow}</p>
        <h2>{trust.title}</h2>
      </div>

      <div className="trust-section__middle">
        <p className="trust-section__body">{trust.body}</p>
        <div className="trust-section__instrument" aria-label="Illustration of signal confidence changing with input quality">
          <div className="trust-instrument__labels">
            <span>INPUT QUALITY</span>
            <span>CONFIDENCE / CONDITIONAL</span>
          </div>
          <div className="trust-instrument__track" aria-hidden="true">
            <span className="trust-instrument__noise" />
            <span className="trust-instrument__usable" />
            <i />
          </div>
          <div className="trust-instrument__scale" aria-hidden="true">
            <span>REPEAT</span>
            <span>REVIEW</span>
            <span>USABLE</span>
          </div>
        </div>
      </div>

      <div className="trust-section__factors">
        {trust.factors.map((factor, index) => (
          <article className="trust-factor" key={factor.title}>
            <div className="trust-factor__number">{String(index + 1).padStart(2, '0')}</div>
            <h3>{factor.title}</h3>
            <p>{factor.body}</p>
          </article>
        ))}
      </div>

      <div className="trust-section__closing">
        <span>VYTAL / QUALITY PRINCIPLE</span>
        <strong>A bad reading is worse than no reading.</strong>
      </div>
    </SectionShell>
  )
}
