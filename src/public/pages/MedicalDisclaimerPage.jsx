import SectionThemeBoundary from '../components/system/SectionThemeBoundary.jsx'

export default function MedicalDisclaimerPage() {
  return (
    <SectionThemeBoundary theme="light" as="section" className="public-supporting-page public-route-premise">
      <div className="public-shell public-route-premise__inner">
        <p className="ref-kicker">TRUST / MEDICAL BOUNDARY</p>
        <h1>Medical disclaimer</h1>
        <p>Vytal provides screening support and research-oriented context. It is not a diagnosis, a substitute for professional care or a replacement for clinically validated medical devices.</p>
      </div>
    </SectionThemeBoundary>
  )
}
