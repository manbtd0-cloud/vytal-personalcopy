import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import PulseMark from '../../components/PulseMark.jsx'
import { publicNavItems } from '../content/navigation.js'

function focusableNodes(node) {
  if (!node) return []
  return Array.from(node.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'))
}

export default function PublicNav({ theme = 'dark' }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef(null)
  const menuButtonRef = useRef(null)
  const previousFocusRef = useRef(null)

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  useEffect(() => {
    if (!mobileOpen) return undefined

    previousFocusRef.current = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const menu = menuRef.current
    const menuNodes = focusableNodes(menu)
    const closeButton = menuButtonRef.current
    const cycleNodes = [closeButton, ...menuNodes].filter(Boolean)
    const initialNode = menuNodes[0] ?? closeButton
    initialNode?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setMobileOpen(false)
        return
      }

      if (event.key !== 'Tab' || !cycleNodes.length) return

      const currentIndex = cycleNodes.indexOf(document.activeElement)
      if (currentIndex === -1) {
        event.preventDefault()
        initialNode?.focus()
        return
      }

      event.preventDefault()
      const direction = event.shiftKey ? -1 : 1
      const nextIndex = (currentIndex + direction + cycleNodes.length) % cycleNodes.length
      cycleNodes[nextIndex]?.focus()
    }

    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      const previous = previousFocusRef.current
      if (previous && typeof previous.focus === 'function') previous.focus()
    }
  }, [mobileOpen])

  const closeMobile = () => setMobileOpen(false)

  return (
    <header
      className="public-nav-wrap"
      data-public-nav
      data-nav-theme={theme}
      data-nav-scrolled={scrolled ? 'true' : 'false'}
    >
      <nav className="public-nav public-shell" aria-label="Public">
        <NavLink className="public-nav__brand" to="/" onClick={closeMobile}>
          <PulseMark size={28} />
          <span>VYTAL</span>
        </NavLink>

        <div className="public-nav__links">
          {publicNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `public-nav__link${isActive ? ' is-active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <NavLink className="public-nav__cta" to="/scan">
          Start Screening
        </NavLink>

        <button
          ref={menuButtonRef}
          type="button"
          className="public-nav__menu-button"
          aria-label={mobileOpen ? 'Close menu' : 'Menu'}
          aria-expanded={mobileOpen}
          aria-controls="public-mobile-menu"
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? 'Close' : 'Menu'}
        </button>
      </nav>

      {mobileOpen ? (
        <nav
          ref={menuRef}
          id="public-mobile-menu"
          className="public-mobile-menu"
          aria-label="Public mobile"
        >
          <div className="public-mobile-menu__meta" aria-hidden="true">
            <span>VYTAL / PUBLIC</span>
            <span>SCREENING SUPPORT, NOT DIAGNOSIS</span>
          </div>
          <div className="public-mobile-menu__links">
            {publicNavItems.map((item, index) => (
              <NavLink key={item.to} to={item.to} onClick={closeMobile}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
          <NavLink className="public-mobile-menu__cta" to="/scan" onClick={closeMobile}>
            <span>Enter Vytal</span>
            <strong>Start Screening ↗</strong>
          </NavLink>
        </nav>
      ) : null}
    </header>
  )
}
