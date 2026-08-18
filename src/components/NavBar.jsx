import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import PulseMark from './PulseMark.jsx'
import AiConfigModal from './AiConfigModal.jsx'

const links = [
  { to: '/', label: 'Scan', end: true },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/report', label: 'Report' },
]

export default function NavBar({ onReplayIntro }) {
  const [showAiModal, setShowAiModal] = useState(false)

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <NavLink to="/" className="navbar__brand" end>
            <PulseMark size={26} animate />
            VYTAL
          </NavLink>
          {onReplayIntro && (
            <button
              onClick={onReplayIntro}
              title="Replay intro splash animation"
              style={{
                background: 'transparent',
                border: '1px solid var(--card-border)',
                color: 'var(--text-dim)',
                borderRadius: '999px',
                padding: '3px 8px',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              ▶ Intro
            </button>
          )}
        </div>

        <nav className="navbar__links">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => 'navlink' + (isActive ? ' active' : '')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar__status" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => setShowAiModal(true)}
            style={{
              background: 'rgba(255,176,32,0.12)',
              border: '1px solid rgba(255,176,32,0.3)',
              color: 'var(--accent2)',
              borderRadius: '999px',
              padding: '4px 10px',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            🤖 AI Engine
          </button>

          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="pill-dot" />
            Synced
          </span>
        </div>
      </div>

      <AiConfigModal isOpen={showAiModal} onClose={() => setShowAiModal(false)} />
    </header>
  )
}
