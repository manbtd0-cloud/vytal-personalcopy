import SectionShell from '../SectionShell.jsx'
import ScrollReveal from '../reactbits/ScrollReveal.jsx'
import { homeContent } from '../../content/home.js'

export default function CameraScienceSection() {
  const { cameraScience } = homeContent

  return (
    <SectionShell id="camera-science" tone="raised" className="camera-science-section">
      <div className="camera-science__grid">
        <div className="camera-science__copy">
          <p className="public-eyebrow">{cameraScience.eyebrow}</p>
          <ScrollReveal tag="h2" className="landing-section-heading camera-science__heading" baseRotation={1.2} blurStrength={2}>
            {cameraScience.title}
          </ScrollReveal>
          <p className="camera-science__body">{cameraScience.body}</p>
          <div className="camera-science__technical">
            <span>TECHNICAL TERM</span>
            <strong>{cameraScience.technical}</strong>
          </div>
        </div>

        <div className="signal-explainer" aria-label="Illustration of camera light channels becoming a physiological waveform">
          <div className="signal-explainer__topline">
            <span>VISIBLE INPUT</span>
            <span>HIDDEN VARIATION</span>
          </div>

          <div className="signal-explainer__channels" aria-hidden="true">
            <span className="signal-channel signal-channel--r" />
            <span className="signal-channel signal-channel--g" />
            <span className="signal-channel signal-channel--b" />
          </div>

          <div className="signal-explainer__conversion" aria-hidden="true">
            <span>RGB</span>
            <i />
            <span>SIGNAL</span>
          </div>

          <svg
            className="signal-explainer__wave"
            viewBox="0 0 720 180"
            role="img"
            aria-label="Simplified physiological signal waveform"
          >
            <path
              className="signal-explainer__wave-grid"
              d="M0 30H720 M0 90H720 M0 150H720 M120 0V180 M240 0V180 M360 0V180 M480 0V180 M600 0V180"
            />
            <path
              className="signal-explainer__wave-line"
              d="M0 101 C28 99 46 98 66 102 C86 106 91 71 108 65 C123 60 128 101 149 101 C168 101 183 100 198 102 C219 104 223 91 236 88 C249 85 255 101 276 101 C299 101 311 100 326 102 C344 105 351 59 369 53 C384 48 390 102 411 102 C432 102 444 100 462 101 C482 103 489 83 503 78 C519 73 523 101 545 101 C566 101 579 99 594 101 C615 104 620 67 638 61 C654 55 661 101 681 101 C696 101 708 100 720 101"
            />
          </svg>

          <div className="signal-explainer__labels">
            {cameraScience.labels.map((label, index) => (
              <span key={label}>
                <b>{String(index + 1).padStart(2, '0')}</b>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  )
}
