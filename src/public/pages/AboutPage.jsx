import SectionThemeBoundary from '../components/system/SectionThemeBoundary.jsx'

export default function AboutPage() {
  return (
    <SectionThemeBoundary theme="light" as="section" className="public-supporting-page public-route-premise">
      <div className="public-shell public-route-premise__inner">
        <p className="ref-kicker">ABOUT / PRINCIPLES</p>
        <h1>Build the product to be harder to overclaim.</h1>
        <p>Vytal is organized around accessibility, evidence-aware communication, honest uncertainty and health information people can understand.</p>
      </div>
    </SectionThemeBoundary>
  )
}
