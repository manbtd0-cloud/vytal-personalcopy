import { Link } from 'react-router-dom'
import SectionThemeBoundary from '../components/system/SectionThemeBoundary.jsx'
import '../styles/trust-legal.css'

export default function MedicalDisclaimerPage() {
  return (
    <SectionThemeBoundary
      theme="light"
      as="section"
      className="legal-document legal-document--medical"
      data-legal-document="medical-disclaimer"
    >
      <div className="public-shell legal-document__layout">
        <header className="legal-document__header">
          <p className="ref-kicker">TRUST / MEDICAL BOUNDARY</p>
          <h1>Medical disclaimer</h1>
          <p>
            Vytal is a screening and research prototype. It is designed to provide screening context and support understanding; it is not a medical diagnosis or a substitute for professional medical assessment.
          </p>
        </header>

        <nav className="legal-document__contents" aria-label="Medical disclaimer contents">
          <a href="#medical-screening">Screening</a>
          <a href="#medical-research">Research pathways</a>
          <a href="#medical-confidence">Confidence</a>
          <a href="#medical-urgent">Urgent symptoms</a>
          <a href="#medical-confirmation">Confirmation</a>
        </nav>

        <div className="legal-document__body">
          <section id="medical-screening">
            <p className="legal-document__index">01</p>
            <h2>Screening support, not diagnosis</h2>
            <p>
              Results should be interpreted as screening information, estimates, proxies or trends according to the specific pathway. They should not be treated as proof that a condition is present or absent.
            </p>
          </section>

          <section id="medical-research">
            <p className="legal-document__index">02</p>
            <h2>Experimental and research pathways</h2>
            <p>
              Some Vytal pathways are experimental or research directions rather than validated clinical measurements. Camera oxygen proxies are not clinical pulse oximetry; pulse-interval rhythm screening is not an ECG diagnosis; anemia and jaundice indicators are not laboratory tests; and blood-pressure trend work is not a cuff replacement.
            </p>
          </section>

          <section id="medical-confidence">
            <p className="legal-document__index">03</p>
            <h2>Signal quality and uncertainty</h2>
            <p>
              Motion, lighting, visibility, camera behavior and insufficient clean signal can reduce reliability. Low confidence can correctly result in no reading and a request to retry. A reading that passes quality checks can still contain measurement error or uncertainty.
            </p>
          </section>

          <section id="medical-urgent">
            <p className="legal-document__index">04</p>
            <h2>Urgent symptoms override the app</h2>
            <p>
              If you have urgent symptoms or believe you may need immediate medical attention, seek appropriate urgent medical care regardless of what Vytal displays. Do not delay care because a screening result appears reassuring.
            </p>
          </section>

          <section id="medical-confirmation">
            <p className="legal-document__index">05</p>
            <h2>Clinical confirmation may be necessary</h2>
            <p>
              A concerning, unusual or research-oriented screening result may require clinical confirmation using a qualified healthcare professional, validated medical device, laboratory test or other appropriate clinical method.
            </p>
          </section>
        </div>

        <aside className="legal-document__boundary">
          <p>Data handling</p>
          <Link to="/privacy">Read Privacy <span aria-hidden="true">→</span></Link>
        </aside>
      </div>
    </SectionThemeBoundary>
  )
}
