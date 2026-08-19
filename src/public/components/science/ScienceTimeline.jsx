import MediaFrame from '../system/MediaFrame.jsx'
import SignalThread from '../system/SignalThread.jsx'
import { scienceMilestones } from '../../content/science.js'
import { getMediaSlotById } from '../../content/mediaSlots.js'

export default function ScienceTimeline() {
  return (
    <section className="science-timeline" data-science-timeline>
      <SignalThread
        variant="timeline"
        tone="coral"
        density="dense"
        direction="vertical"
        className="science-timeline__rail"
      />

      <div className="public-shell science-timeline__items">
        {scienceMilestones.map((milestone, index) => {
          const slot = getMediaSlotById(milestone.mediaSlotId)
          const published = milestone.kind === 'published'

          return (
            <article
              className={`science-milestone science-milestone--${index + 1} ${published ? 'is-published' : 'is-internal'}`}
              data-science-milestone={milestone.id}
              data-weight={milestone.weight}
              key={milestone.id}
            >
              <div className="science-milestone__year">{milestone.year}</div>

              <div className="science-milestone__copy">
                <p className="science-milestone__kind">
                  {published ? 'Published research' : 'Internal project milestone'}
                </p>
                <h2>{milestone.title}</h2>
                <p className="science-milestone__authors">{milestone.authors}</p>
                <p className="science-milestone__note">{milestone.note}</p>

                {milestone.sourceUrl ? (
                  <a
                    className="science-milestone__source"
                    href={milestone.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {milestone.sourceLabel} <span aria-hidden="true">↗</span>
                  </a>
                ) : (
                  <p className="science-milestone__internal-note">
                    Internal milestone — not a peer-reviewed research publication.
                  </p>
                )}
              </div>

              {slot ? <MediaFrame slot={slot} className="science-milestone__media" /> : null}
            </article>
          )
        })}
      </div>
    </section>
  )
}
