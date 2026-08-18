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
    <footer className="public-footer">
      <div className="public-shell public-footer__grid">
        <div className="public-footer__brand-block">
          <Link className="public-footer__brand" to="/">
            <PulseMark size={28} />
            <span>VYTAL</span>
          </Link>
          <p>Vytal is a screening and research prototype, not a diagnostic medical device.</p>
          <Link className="public-footer__scan" to="/scan">
            Start Screening
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
      <div className="public-shell public-footer__bottom">
        <span>Camera-first health screening research.</span>
        <span>Screening support, not diagnosis.</span>
      </div>
    </footer>
  )
}
