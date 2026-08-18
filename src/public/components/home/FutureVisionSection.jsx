import SectionShell from '../SectionShell.jsx'
import { homeContent } from '../../content/home.js'

export default function FutureVisionSection() {
  const { future } = homeContent

  return (
    <SectionShell tone="dark" className="future-vision-section">
      <div className="future-vision__header">
        <div>
          <p className="public-eyebrow">{future.eyebrow}</p>
          <h2 className="landing-section-heading">{future.title}</h2>
        </div>
        <div className="future-vision__intro">
          <span className="future-vision__status">{future.label}</span>
          <p>{future.body}</p>
          <p className="future-vision__caution">
            External-device and population-level stages are product research directions. They are not presented here as production-ready clinical integrations.
          </p>
        </div>
      </div>

      <div className="future-vision__rail" aria-label="Vytal sensing research roadmap">
        {future.stages.map((stage, index) => (
          <article
            key={stage}
            className={`future-stage${index === 0 ? ' future-stage--current' : ' future-stage--future'}`}
          >
            <div className="future-stage__meta">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <span>{index === 0 ? 'FOUNDATION' : 'RESEARCH DIRECTION'}</span>
            </div>
            <div className="future-stage__node" aria-hidden="true">
              <span />
              <i />
            </div>
            <h3>{stage}</h3>
            <p>
              {index === 0
                ? 'Camera-derived screening is the current foundation of the Vytal experience.'
                : 'A future sensing layer being explored around the same continuity and uncertainty principles.'}
            </p>
          </article>
        ))}
      </div>
    </SectionShell>
  )
}
