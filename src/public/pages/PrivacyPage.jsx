import { Link } from 'react-router-dom'
import SectionThemeBoundary from '../components/system/SectionThemeBoundary.jsx'
import '../styles/trust-legal.css'

export default function PrivacyPage() {
  return (
    <SectionThemeBoundary
      theme="light"
      as="section"
      className="legal-document"
      data-legal-document="privacy"
    >
      <div className="public-shell legal-document__layout">
        <header className="legal-document__header">
          <p className="ref-kicker">TRUST / DATA</p>
          <h1>Privacy</h1>
          <p>
            This page describes current prototype behavior in the codebase. It is not a promise about a future production backend, hosting model or regulatory architecture.
          </p>
        </header>

        <nav className="legal-document__contents" aria-label="Privacy contents">
          <a href="#privacy-camera">Camera</a>
          <a href="#privacy-storage">Local records</a>
          <a href="#privacy-ai">AI explanation</a>
          <a href="#privacy-sync">Cloud sync</a>
          <a href="#privacy-status">Prototype status</a>
        </nav>

        <div className="legal-document__body">
          <section id="privacy-camera">
            <p className="legal-document__index">01</p>
            <h2>Camera processing</h2>
            <p>
              In the current screening flow, camera processing happens in the browser. The physiological signal is derived from camera input locally in the web app; the AI explanation path described below sends derived screening context, not raw camera frames.
            </p>
          </section>

          <section id="privacy-storage">
            <p className="legal-document__index">02</p>
            <h2>Records on this device</h2>
            <p>
              Current prototype screening records are stored in browser localStorage for that browser profile. They are not automatically a cross-device health record. Clearing site data, changing browser profiles or using another device can remove or make those local records unavailable.
            </p>
          </section>

          <section id="privacy-ai">
            <p className="legal-document__index">03</p>
            <h2>AI explanation services</h2>
            <p>
              When an external AI provider is configured, derived screening measurements and context may be sent from the browser to Groq or Qwen / DashScope to generate an explanation. If no configured provider succeeds, the prototype can fall back to local rule-based explanation instead.
            </p>
          </section>

          <section id="privacy-sync">
            <p className="legal-document__index">04</p>
            <h2>Optional cloud sync path</h2>
            <p>
              When sync is invoked, pending records and generated FHIR-formatted data may be sent to the configured cloud sync endpoint. A failed or unavailable sync should leave records pending locally rather than treating them as confirmed remote storage.
            </p>
          </section>

          <section id="privacy-status">
            <p className="legal-document__index">05</p>
            <h2>Prototype status</h2>
            <p>
              This privacy description reflects current prototype behavior, not a finalized production privacy architecture. Any public deployment handling real health data requires its own reviewed storage, retention, access-control, consent, security and third-party service decisions.
            </p>
          </section>
        </div>

        <aside className="legal-document__boundary">
          <p>Related trust boundary</p>
          <Link to="/medical-disclaimer">Read the Medical Disclaimer <span aria-hidden="true">→</span></Link>
        </aside>
      </div>
    </SectionThemeBoundary>
  )
}
