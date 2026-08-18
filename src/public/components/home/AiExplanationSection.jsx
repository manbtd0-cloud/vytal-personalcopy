import { useState } from 'react'
import SectionShell from '../SectionShell.jsx'
import PixelTransition from '../reactbits/PixelTransition.jsx'
import { homeContent } from '../../content/home.js'

function RawReadingPanel() {
  const { ai } = homeContent

  return (
    <div
      id="ai-raw-panel"
      className="ai-reading-panel ai-reading-panel--raw"
      role="tabpanel"
      aria-label="Raw reading"
    >
      <div className="ai-reading-panel__header">
        <span>PHYSIOLOGICAL OUTPUT</span>
        <span>MEASUREMENT LAYER</span>
      </div>

      <div className="ai-reading-panel__metrics">
        {ai.raw.slice(0, 3).map((metric, index) => {
          const [label, ...valueParts] = metric.split(' ')
          return (
            <div className="ai-reading-metric" key={metric}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{label}</strong>
              <p>{valueParts.join(' ')}</p>
            </div>
          )
        })}
      </div>

      <div className="ai-reading-panel__foot">
        <span>MEASURE</span>
        <i />
        <span>CONTEXT</span>
      </div>
    </div>
  )
}

function ExplainedPanel() {
  const { ai } = homeContent

  return (
    <div
      id="ai-explained-panel"
      className="ai-reading-panel ai-reading-panel--explained"
      role="tabpanel"
      aria-label="Explained"
    >
      <div className="ai-reading-panel__header">
        <span>PLAIN-LANGUAGE CONTEXT</span>
        <span>EXPLANATION LAYER</span>
      </div>

      <div className="ai-explained-copy">
        <p>{ai.explained}</p>
      </div>

      <div className="ai-reading-panel__foot">
        <span>MEASUREMENT</span>
        <i />
        <span>UNDERSTANDING</span>
      </div>
    </div>
  )
}

export default function AiExplanationSection() {
  const { ai } = homeContent
  const [activeTab, setActiveTab] = useState('raw')
  const explained = activeTab === 'explained'

  return (
    <SectionShell tone="dark" className="ai-explanation-section">
      <div className="ai-explanation__grid">
        <div className="ai-explanation__copy">
          <p className="public-eyebrow">{ai.eyebrow}</p>
          <h2 className="landing-section-heading">{ai.title}</h2>
          <p className="ai-explanation__statement">{ai.statement}</p>
          <p className="ai-explanation__body">
            Vytal's screening pipeline produces the measurements first. AI belongs after that step, where it can translate technical output into more understandable screening context.
          </p>
          <div className="ai-explanation__principle" aria-hidden="true">
            <span>MEASURE</span>
            <i />
            <span>EXPLAIN</span>
          </div>
        </div>

        <div className="ai-explanation__demo">
          <div className="ai-explanation__demo-topline">
            <span>{ai.raw[3]}</span>
            <span>ILLUSTRATIVE / NOT A DIAGNOSIS</span>
          </div>

          <div className="ai-explanation__tabs" role="tablist" aria-label="Reading presentation">
            <button
              type="button"
              role="tab"
              id="ai-raw-tab"
              aria-controls="ai-raw-panel"
              aria-selected={!explained}
              className={!explained ? 'is-active' : ''}
              onClick={() => setActiveTab('raw')}
            >
              {ai.tabs[0]}
            </button>
            <button
              type="button"
              role="tab"
              id="ai-explained-tab"
              aria-controls="ai-explained-panel"
              aria-selected={explained}
              className={explained ? 'is-active' : ''}
              onClick={() => setActiveTab('explained')}
            >
              {ai.tabs[1]}
            </button>
          </div>

          <PixelTransition
            firstContent={<RawReadingPanel />}
            secondContent={<ExplainedPanel />}
            active={explained}
            gridSize={7}
            pixelColor="var(--accent)"
            animationStepDuration={0.3}
            className="ai-explanation__transition"
          />

          <div className="ai-explanation__demo-footer">
            <span>DATA SOURCE / SCREENING PIPELINE</span>
            <span>AI ROLE / INTERPRETATION ONLY</span>
          </div>
        </div>
      </div>
    </SectionShell>
  )
}
