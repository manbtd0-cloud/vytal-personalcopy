import { Link } from 'react-router-dom'
import MediaFrame from '../system/MediaFrame.jsx'
import SectionThemeBoundary from '../system/SectionThemeBoundary.jsx'
import SignalThread from '../system/SignalThread.jsx'
import { mediaSlots } from '../../content/mediaSlots.js'
import { homeReference } from '../../content/homeReference.js'
import { homeScienceMilestones } from '../../content/science.js'

export default function ScienceLineageChapter() {
  const content = homeReference.scienceLineage

  return (
    <SectionThemeBoundary
      theme="dark"
      as="section"
      className="ref-science-lineage"
      data-home-chapter="science-lineage"
    >
      <div className="public-shell ref-science-lineage__header">
        <p className="ref-kicker">{content.kicker}</p>
        <h2>{content.title}</h2>
        <p className="ref-science-lineage__body">{content.body}</p>
      </div>

      <div className="public-shell ref-science-lineage__stage">
        <div className="ref-science-lineage__timeline">
          <SignalThread variant="timeline" tone="coral" density="quiet" className="ref-science-lineage__thread" />
          <ol className="ref-science-lineage__milestones">
            {homeScienceMilestones.map((milestone) => (
              <li key={milestone.id} data-milestone-kind={milestone.kind}>
                <p className="ref-science-lineage__year">{milestone.year}</p>
                <div className="ref-science-lineage__milestone-copy">
                  <h3>{milestone.title}</h3>
                  <p>{milestone.note}</p>
                  {milestone.sourceUrl ? (
                    <a href={milestone.sourceUrl} target="_blank" rel="noreferrer">
                      {milestone.sourceLabel} ↗
                    </a>
                  ) : (
                    <span>{milestone.sourceLabel}</span>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>

        <MediaFrame
          slot={mediaSlots.HOME_SCIENCE_DIAGRAM_01}
          className="ref-science-lineage__media"
        />
      </div>

      <div className="public-shell ref-science-lineage__close">
        <Link to="/science">{content.cta} →</Link>
      </div>
    </SectionThemeBoundary>
  )
}
