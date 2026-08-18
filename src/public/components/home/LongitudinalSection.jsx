import SectionShell from '../SectionShell.jsx'
import { homeContent } from '../../content/home.js'

const points = [
  [16, 126],
  [96, 116],
  [176, 121],
  [256, 96],
  [336, 105],
  [416, 77],
  [496, 83],
  [576, 55],
  [656, 64],
]

const polyline = points.map(([x, y]) => `${x},${y}`).join(' ')

export default function LongitudinalSection() {
  const { longitudinal } = homeContent

  return (
    <SectionShell tone="raised" className="longitudinal-section">
      <div className="longitudinal-section__header">
        <div>
          <p className="public-eyebrow">{longitudinal.eyebrow}</p>
          <h2 className="landing-section-heading">{longitudinal.title}</h2>
        </div>
        <p className="longitudinal-section__body">{longitudinal.body}</p>
      </div>

      <div className="longitudinal-section__visual">
        <div className="longitudinal-chart">
          <div className="longitudinal-chart__meta">
            <span>{longitudinal.chartLabel}</span>
            <span>REPEATED SCREENING CONTEXT</span>
          </div>
          <svg viewBox="0 0 672 160" role="img" aria-label="Illustrative longitudinal trend over repeated readings">
            <path className="longitudinal-chart__grid" d="M0 24H672 M0 80H672 M0 136H672 M84 0V160 M168 0V160 M252 0V160 M336 0V160 M420 0V160 M504 0V160 M588 0V160" />
            <polyline className="longitudinal-chart__line" points={polyline} />
            {points.map(([x, y], index) => (
              <circle className="longitudinal-chart__point" cx={x} cy={y} r="4" key={`${x}-${y}-${index}`} />
            ))}
          </svg>
          <div className="longitudinal-chart__axis" aria-hidden="true">
            <span>EARLIER</span>
            <span>NOW</span>
          </div>
        </div>

        <div className="longitudinal-section__features">
          {longitudinal.features.map((feature, index) => (
            <div key={feature}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{feature}</strong>
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  )
}
