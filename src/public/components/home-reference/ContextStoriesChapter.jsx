import { useState } from 'react'
import MediaFrame from '../system/MediaFrame.jsx'
import SectionThemeBoundary from '../system/SectionThemeBoundary.jsx'
import StoryOverlay from '../system/StoryOverlay.jsx'
import { impactScenarios } from '../../content/impact.js'
import { getMediaSlotById } from '../../content/mediaSlots.js'

const previewScenarios = impactScenarios.slice(0, 3)

export default function ContextStoriesChapter() {
  const [selectedId, setSelectedId] = useState(null)
  const selected = impactScenarios.find((scenario) => scenario.id === selectedId) ?? null

  return (
    <>
      <SectionThemeBoundary
        theme="ivory"
        as="section"
        className="ref-context-stories"
        data-home-chapter="context-stories"
      >
        <div className="public-shell ref-context-stories__intro">
          <p className="ref-kicker">CONTEXT / PEOPLE</p>
          <h2>Health signals only matter inside real life.</h2>
          <p>
            Vytal is being shaped around the moments before, between and beyond clinical care. These are illustrative product contexts—not patient stories or deployment claims.
          </p>
        </div>

        <div className="public-shell ref-context-stories__grid">
          {previewScenarios.map((scenario, index) => {
            const slot = getMediaSlotById(scenario.mediaSlotIds[0])

            return (
              <article
                className={`ref-story-preview ref-story-preview--${index + 1}`}
                data-story-preview={scenario.id}
                key={scenario.id}
              >
                {slot ? <MediaFrame slot={slot} className="ref-story-preview__media" /> : null}
                <div className="ref-story-preview__copy">
                  <p className="ref-story-preview__label">Illustrative scenario</p>
                  <h3>{scenario.title}</h3>
                  <p>{scenario.summary}</p>
                  <button
                    type="button"
                    aria-label={`Open ${scenario.title}`}
                    onClick={() => setSelectedId(scenario.id)}
                  >
                    <span>View scenario</span>
                    <span aria-hidden="true">↗</span>
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </SectionThemeBoundary>

      <StoryOverlay
        scenario={selected}
        scenarios={impactScenarios}
        onSelect={setSelectedId}
        onClose={() => setSelectedId(null)}
      />
    </>
  )
}
