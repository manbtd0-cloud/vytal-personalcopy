import { Link } from 'react-router-dom'
import SectionThemeBoundary from '../components/system/SectionThemeBoundary.jsx'
import '../styles/trust-legal.css'

export default function PublicNotFoundPage() {
  return (
    <SectionThemeBoundary
      theme="dark"
      as="section"
      className="public-not-found"
      aria-labelledby="public-not-found-title"
      data-public-not-found
    >
      <div className="public-shell public-not-found__inner">
        <p className="ref-kicker">404 / SIGNAL ENDS HERE</p>
        <div className="public-not-found__code" aria-hidden="true">404</div>
        <h1 id="public-not-found-title">Page not found</h1>
        <p>The public route you followed does not exist. Return to the Vytal story or enter the current screening experience.</p>
        <div className="public-not-found__actions">
          <Link to="/">Back to Home</Link>
          <Link to="/scan">Start Screening</Link>
        </div>
      </div>
    </SectionThemeBoundary>
  )
}
