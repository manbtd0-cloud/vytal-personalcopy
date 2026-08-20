import { Link } from 'react-router-dom'
import MediaFrame from '../system/MediaFrame.jsx'
import SectionThemeBoundary from '../system/SectionThemeBoundary.jsx'
import SignalThread from '../system/SignalThread.jsx'
import { getMediaSlotById } from '../../content/mediaSlots.js'
import { homePlatformArcItems } from '../../content/homeReference.js'

export default function PlatformArcChapter() {
  return (
    <SectionThemeBoundary
      theme="dark"
      as="section"
      className="ref-platform-arc"
      data-home-chapter="platform-arc"
    >
      <div className="public-shell ref-platform-arc__intro">
        <p className="ref-kicker">PLATFORM / ARC</p>
        <h2>Start with the camera. Build outward carefully.</h2>
        <p>
          Vytal’s platform story is layered by maturity. The camera-first screening foundation comes before broader sensing ideas, and future hardware remains visibly labelled as research direction.
        </p>
      </div>

      <div className="ref-platform-arc__blocks">
        {homePlatformArcItems.map((item, index) => {
          const slot = getMediaSlotById(item.mediaSlotId)
          const future = item.id === 'future'

          return (
            <article
              className={`ref-platform-block ref-platform-block--${item.id}`}
              data-platform-beat={item.id}
              key={item.id}
            >
              <div className="public-shell ref-platform-block__inner">
                <div className="ref-platform-block__meta">
                  <span>{item.index}</span>
                  <p>{item.status}</p>
                </div>

                <div className="ref-platform-block__copy">
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                  {future ? <strong>{item.status}</strong> : null}
                </div>

                <div className="ref-platform-block__visual">
                  {slot ? <MediaFrame slot={slot} className="ref-platform-block__media" /> : null}
                  <SignalThread
                    variant={item.signalVariant}
                    tone={future ? 'coral' : index === 1 ? 'amber' : 'mint'}
                    density={future ? 'dense' : 'default'}
                    className="ref-platform-block__thread"
                  />
                </div>
              </div>
            </article>
          )
        })}
      </div>

      <div className="public-shell ref-platform-arc__footer">
        <Link to="/platform">Explore the platform <span aria-hidden="true">↗</span></Link>
      </div>
    </SectionThemeBoundary>
  )
}
