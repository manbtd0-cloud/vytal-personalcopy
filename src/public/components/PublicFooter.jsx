import { Link } from 'react-router-dom'
import PulseMark from '../../components/PulseMark.jsx'

const footerGroups = [
  {
    title: 'Explore',
    links: [
      ['/screenings', 'Screenings'],
      ['/science', 'Science'],
      ['/impact', 'Impact'],
      ['/about', 'About'],
    ],
  },
  {
    title: 'Trust',
    links: [
      ['/privacy', 'Privacy'],
      ['/medical-disclaimer', 'Medical Disclaimer'],
    ],
  },
]

export default function PublicFooter() {
  return (
    <footer className="public-footer" data-public-theme="dark">
      <div className="public-shell public-footer__intro">
        <p className="public-footer__eyebrow">ACCESSIBLE HEALTH-SENSING RESEARCH</p>
        <p className="public-footer__statement">A useful first health signal should be easier to reach.</p>
      </div>

      <div className="public-shell public-footer__grid">
        <div className="public-footer__brand-block">
          <Link className="public-footer__brand" to="/">
            <PulseMark size={30} />
            <span>VYTAL</span>
          </Link>
          <p>
            Vytal explores camera-first screening, uncertainty-aware signal interpretation and continuity of health context.
          </p>
          <Link className="public-footer__scan" to="/scan">
            Start Screening ↗
          </Link>
        </div>

        {footerGroups.map((group) => (
          <div className="public-footer__group" key={group.title}>
            <p>{group.title}</p>
            {group.links.map(([to, label]) => (
              <Link to={to} key={to}>
                {label}
              </Link>
            ))}
          </div>
        ))}
      </div>

      <div className="public-footer__wordmark" aria-hidden="true">VYTAL</div>

      <div className="public-shell public-footer__bottom">
        <span>Screening and research prototype.</span>
        <span>Screening support, not diagnosis.</span>
      </div>
    </footer>
  )
}
