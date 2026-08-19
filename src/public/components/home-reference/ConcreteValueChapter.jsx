import SectionThemeBoundary from '../system/SectionThemeBoundary.jsx'
import SignalThread from '../system/SignalThread.jsx'
import { homeConcreteValueItems } from '../../content/homeReference.js'

export default function ConcreteValueChapter() {
  return (
    <SectionThemeBoundary
      theme="light"
      as="section"
      className="ref-concrete-value"
      data-home-chapter="concrete-value"
    >
      <div className="public-shell ref-concrete-value__intro">
        <p className="ref-kicker">VALUE / IN PRACTICE</p>
        <h2>What survives after the sensing moment.</h2>
        <p>
          The useful part is not a dramatic camera effect. It is the chain from signal to understandable, reusable screening context.
        </p>
      </div>

      <div className="public-shell ref-concrete-value__list">
        {homeConcreteValueItems.map((item, index) => (
          <article className="ref-value-unit" data-value-unit={item.title.toLowerCase()} key={item.title}>
            <div className="ref-value-unit__index">{item.index}</div>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
            <div className="ref-value-unit__signal" aria-hidden="true">
              <SignalThread
                variant={index < 2 ? 'lock' : index === 3 ? 'timeline' : 'context'}
                tone={index === 0 ? 'coral' : 'ink'}
                density="quiet"
              />
            </div>
          </article>
        ))}
      </div>
    </SectionThemeBoundary>
  )
}
