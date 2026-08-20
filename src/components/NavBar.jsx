import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import PulseMark from './PulseMark.jsx'
import AiConfigModal from './AiConfigModal.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const links = [
  { to: '/', label: 'Scan', end: true },
  { to: '/patients', label: 'Patients' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/report', label: 'Report' },
  { to: '/account', label: 'Account' },
  { to: '/billing', label: 'Billing' },
]

export default function NavBar({ onReplayIntro }) {
  const [showAiModal, setShowAiModal] = useState(false)
  const { configured, user } = useAuth()

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <div className="navbar__brand-group">
          <NavLink to="/" className="navbar__brand" end>
            <PulseMark size={26} animate />
            <span className="navbar__brand-copy">
              <strong>VYTAL</strong>
              <small>Health intelligence</small>
            </span>
          </NavLink>
          {onReplayIntro && (
            <button
              onClick={onReplayIntro}
              className="navbar__intro-btn"
              title="Replay intro splash animation"
            >
              View intro
            </button>
          )}
        </div>

        <nav className="navbar__links" aria-label="Primary navigation">
          {links.map((link, index) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => 'navlink' + (isActive ? ' active' : '')}
            >
              <span className="navlink__index">{String(index + 1).padStart(2, '0')}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar__status">
          <button
            onClick={() => setShowAiModal(true)}
            className="navbar__ai-btn"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
              <circle cx="12" cy="12" r="5" />
              <path d="m8.5 15.5 7-7" />
            </svg>
            AI guide
          </button>

          <span className="navbar__sync-state">
            <span className="pill-dot" />
            <span>{configured ? (user ? 'Secure session' : 'Sign in required') : 'Database setup'}</span>
          </span>
        </div>
      </div>

      <AiConfigModal isOpen={showAiModal} onClose={() => setShowAiModal(false)} />
    </header>
  )
}
