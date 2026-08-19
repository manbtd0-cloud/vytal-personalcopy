import MediaFrame from '../components/system/MediaFrame.jsx'
import SectionThemeBoundary from '../components/system/SectionThemeBoundary.jsx'
import SignalThread from '../components/system/SignalThread.jsx'
import ScienceTimeline from '../components/science/ScienceTimeline.jsx'
import { scienceMilestones } from '../content/science.js'
import { getMediaSlotById } from '../content/mediaSlots.js'
import '../styles/science-exhibition.css'

const failureConditions = [
  'Motion',
  'Lighting',
  'Face visibility',
  'Compression',
  'Camera auto-exposure',
  'Insufficient clean signal',
]

const implementationSlot = getMediaSlotById('SCI-HERO-01')
const qualitySlot = getMediaSlotById('SCI-TIMELINE-UNCERTAINTY-01')
const validationSlot = getMediaSlotById('SCI-VALIDATION-01')
const publishedMilestones = scienceMilestones.filter((milestone) => milestone.sourceUrl)

export default function SciencePage() {
  return (
    <main className="science-page">
      <SectionThemeBoundary theme="media-dark" as="section" className="science-hero">
        <SignalThread variant="raw" tone="coral" density="dense" className="science-hero__signal" />
        <div className="public-shell science-hero__inner">
          <p className="ref-kicker">SCIENCE / REMOTE PHYSIOLOGY</p>
          <h1>The interface is simple. The measurement problem is not.</h1>
          <p>
            Camera-based physiology sits at the intersection of optics, signal processing, movement, illumination and biological variation. This page separates published foundations from Vytal’s own prototype work.
          </p>
          <a href="#science-lineage" className="science-hero__cue">Follow the lineage <span aria-hidden="true">↓</span></a>
        </div>
      </SectionThemeBoundary>

      <div id="science-lineage">
        <ScienceTimeline />
      </div>

      <SectionThemeBoundary
        theme="light"
        as="section"
        className="science-implementation"
        data-science-chapter="implementation"
      >
        <div className="public-shell science-implementation__intro">
          <p className="ref-kicker">IMPLEMENTATION / VYTAL</p>
          <h2>From pixels to screening context.</h2>
          <p>
            The useful signal does not appear as a ready-made vital sign. Vytal’s camera-first path is a processing chain in which each stage can add or remove confidence.
          </p>
        </div>

        <div className="public-shell science-implementation__body">
          {implementationSlot ? <MediaFrame slot={implementationSlot} className="science-implementation__diagram" /> : null}
          <div className="science-implementation__pipeline">
            <p>Camera frames → ROI → color signal → filtering → beat timing → context</p>
            <ol>
              <li><span>01</span><strong>Capture</strong><p>Collect a stable sequence of camera frames from a visible region of interest.</p></li>
              <li><span>02</span><strong>Extract</strong><p>Track subtle color variation across time rather than treating a single frame as the measurement.</p></li>
              <li><span>03</span><strong>Filter</strong><p>Reduce unusable variation and preserve timing information that can support pulse-related estimates.</p></li>
              <li><span>04</span><strong>Qualify</strong><p>Keep motion, illumination and clean-signal duration visible in the confidence decision.</p></li>
              <li><span>05</span><strong>Explain</strong><p>Present screening context only after the measurement layer has produced something usable.</p></li>
            </ol>
          </div>
        </div>
      </SectionThemeBoundary>

      <SectionThemeBoundary
        theme="coral"
        as="section"
        className="science-failure"
        data-science-chapter="failure-conditions"
      >
        <div className="public-shell science-failure__intro">
          <p className="ref-kicker">FAILURE CONDITIONS / SIGNAL QUALITY</p>
          <h2>The camera can see a signal—and still not see enough.</h2>
          <p>A responsible system needs explicit ways to reject weak input rather than force every attempt into a number.</p>
        </div>

        <div className="public-shell science-failure__body">
          {qualitySlot ? <MediaFrame slot={qualitySlot} className="science-failure__media" /> : null}
          <ol className="science-failure__list">
            {failureConditions.map((condition, index) => (
              <li key={condition}><span>{String(index + 1).padStart(2, '0')}</span><strong>{condition}</strong></li>
            ))}
          </ol>
        </div>
      </SectionThemeBoundary>

      <SectionThemeBoundary
        theme="dark"
        as="section"
        className="science-validation"
        data-science-chapter="validation"
      >
        <div className="public-shell science-validation__intro">
          <p className="ref-kicker">VALIDATION / CURRENT STATE</p>
          <h2>Prototype first. Claims second.</h2>
        </div>

        <div className="public-shell science-validation__body">
          <div className="science-validation__copy">
            <p><strong>Current state: prototype.</strong> Vytal combines implemented camera-derived signals with research-oriented screening directions at different maturity levels.</p>
            <p>Vytal is not a diagnostic medical device. Research proxies and experimental screens require further validation before stronger clinical claims would be appropriate.</p>
            <p>Signal quality can invalidate a reading. A failed or low-confidence attempt is a valid system outcome.</p>
          </div>
          {validationSlot ? <MediaFrame slot={validationSlot} className="science-validation__media" /> : null}
        </div>
      </SectionThemeBoundary>

      <SectionThemeBoundary
        theme="light"
        as="section"
        className="science-library"
        data-science-chapter="research-library"
      >
        <div className="public-shell science-library__intro">
          <p className="ref-kicker">PRIMARY SOURCES / LIBRARY</p>
          <h2>Read the work behind the lineage.</h2>
          <p>The six external entries below are the published sources used in the timeline. Vytal’s 2026 milestone is intentionally excluded from this publication list.</p>
        </div>

        <ol className="public-shell science-library__list">
          {publishedMilestones.map((milestone, index) => (
            <li key={milestone.id}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <strong>{milestone.year} — {milestone.title}</strong>
                <p>{milestone.authors}</p>
              </div>
              <a href={milestone.sourceUrl} target="_blank" rel="noreferrer">
                {milestone.sourceLabel} <span aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
        </ol>

        <div className="public-shell science-library__boundary" data-science-medical-boundary>
          <p>Screening support, not diagnosis.</p>
          <p>Published remote-PPG research does not by itself validate every Vytal screening direction or turn this prototype into a clinical diagnostic device.</p>
        </div>
      </SectionThemeBoundary>
    </main>
  )
}
