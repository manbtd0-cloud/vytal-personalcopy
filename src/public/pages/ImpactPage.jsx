import { useState } from 'react'
import { Link } from 'react-router-dom'
import MediaFrame from '../components/system/MediaFrame.jsx'
import SectionThemeBoundary from '../components/system/SectionThemeBoundary.jsx'
import SignalThread from '../components/system/SignalThread.jsx'
import StoryOverlay from '../components/system/StoryOverlay.jsx'
import { getMediaSlotById } from '../content/mediaSlots.js'
import {
  healthWorkerFlow,
  impactPrinciples,
  impactScenarios,
} from '../content/impact.js'
import '../styles/impact-archive.css'

function ScenarioMedia({ scenario }) {
  return (
    <div className="impact-scenario__media" aria-label={`${scenario.title} illustrative media placeholders`}>
      {scenario.mediaSlotIds.map((slotId, index) => {
        const slot = getMediaSlotById(slotId)
        return slot ? (
          <MediaFrame
            key={slot.id}
            slot={slot}
            className={`impact-scenario__frame impact-scenario__frame--${index + 1}`}
          />
        ) : null
      })}
    </div>
  )
}

function ImpactScenario({ scenario, index, onOpen }) {
  return (
    <article
      className={`impact-scenario impact-scenario--${index + 1}`}
      data-impact-scenario={scenario.id}
    >
      <ScenarioMedia scenario={scenario} />

      <div className="impact-scenario__copy">
        <div className="impact-scenario__meta">
          <span>{String(index + 1).padStart(2, '0')}</span>
          <span>{scenario.label}</span>
        </div>

        <h2>{scenario.title}</h2>
        <p className="impact-scenario__summary">{scenario.summary}</p>

        <dl className="impact-scenario__details">
          <div><dt>Context</dt><dd>{scenario.context}</dd></div>
          <div><dt>Friction</dt><dd>{scenario.friction}</dd></div>
          <div><dt>Workflow</dt><dd>{scenario.workflow}</dd></div>
          <div><dt>Boundary</dt><dd>{scenario.limitation}</dd></div>
        </dl>

        <button
          type="button"
          aria-label={`Open ${scenario.title}`}
          onClick={() => onOpen(scenario.id)}
        >
          <span>Open scenario</span>
          <span aria-hidden="true">↗</span>
        </button>
      </div>
    </article>
  )
}

export default function ImpactPage() {
  const [selectedId, setSelectedId] = useState(null)
  const selected = impactScenarios.find((scenario) => scenario.id === selectedId) ?? null

  return (
    <main className="impact-page">
      <SectionThemeBoundary theme="media-dark" as="section" className="impact-hero">
        <SignalThread variant="context" tone="coral" density="dense" className="impact-hero__signal" />
        <div className="public-shell impact-hero__inner">
          <p className="ref-kicker">IMPACT / ACCESS CONTEXT</p>
          <h1>The first signal should not depend on perfect access.</h1>
          <p>
            Vytal is being designed around ordinary devices, imperfect connectivity, understandable explanations and continuity beyond one screening. The scenarios below are illustrative product contexts—not patient stories.
          </p>
          <a href="#impact-archive" className="impact-hero__cue">Enter the archive <span aria-hidden="true">↓</span></a>
        </div>
      </SectionThemeBoundary>

      <SectionThemeBoundary
        theme="coral"
        as="section"
        className="impact-access-thesis"
        data-impact-access-thesis="true"
      >
        <div className="public-shell impact-access-thesis__inner">
          <p className="ref-kicker">ACCESS / DESIGN CONSTRAINT</p>
          <h2>Built for where access is imperfect.</h2>
          <p>
            Accessibility is not a decorative claim here. It changes what hardware the product starts with, how much it depends on connectivity, how explanations are written and whether a reading can remain useful after the session ends.
          </p>

          <ol className="impact-access-thesis__principles">
            {impactPrinciples.map((principle, index) => (
              <li key={principle}><span>{String(index + 1).padStart(2, '0')}</span><strong>{principle}</strong></li>
            ))}
          </ol>
        </div>
      </SectionThemeBoundary>

      <SectionThemeBoundary
        id="impact-archive"
        theme="light"
        as="section"
        className="impact-archive"
        data-impact-archive="true"
      >
        <div className="public-shell impact-archive__intro">
          <p className="ref-kicker">ILLUSTRATIVE / CONTEXT ARCHIVE</p>
          <h2>Six ways the same screening layer could meet different constraints.</h2>
          <p>
            These compositions reserve production media and workflow structure without inventing names, outcomes, partnerships or deployments.
          </p>
        </div>

        <div className="public-shell impact-archive__scenarios">
          {impactScenarios.map((scenario, index) => (
            <ImpactScenario
              scenario={scenario}
              index={index}
              onOpen={setSelectedId}
              key={scenario.id}
            />
          ))}
        </div>
      </SectionThemeBoundary>

      <StoryOverlay
        scenario={selected}
        scenarios={impactScenarios}
        onSelect={setSelectedId}
        onClose={() => setSelectedId(null)}
      />

      <SectionThemeBoundary
        theme="dark"
        as="section"
        className="impact-workflow"
        data-impact-workflow-band="true"
      >
        <SignalThread variant="network" tone="mint" density="dense" className="impact-workflow__signal" />
        <div className="public-shell impact-workflow__inner">
          <p className="ref-kicker">FIELD WORKFLOW / ONE PHONE</p>
          <h2>One phone. Many screenings. One continuity problem.</h2>

          <ol className="impact-workflow__steps">
            {healthWorkerFlow.map((step, index) => (
              <li key={step}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{step}</strong>
              </li>
            ))}
          </ol>

          <p className="impact-workflow__boundary">
            This is the intended workflow model, not evidence of a current field deployment or healthcare partnership.
          </p>
        </div>
      </SectionThemeBoundary>

      <SectionThemeBoundary theme="light" as="section" className="impact-entry">
        <div className="public-shell impact-entry__inner">
          <p className="ref-kicker">NEXT / EXPERIENCE</p>
          <h2>Move from context into the product—or follow one scenario end to end.</h2>
          <div className="impact-entry__actions">
            <Link to="/scan">Start Screening</Link>
            <Link to="/journey">Follow an Illustrative Journey</Link>
          </div>
          <p>Screening support, not diagnosis.</p>
        </div>
      </SectionThemeBoundary>
    </main>
  )
}
