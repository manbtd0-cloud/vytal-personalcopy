import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { gsap } from 'gsap'
import PulseMark from '../../components/PulseMark.jsx'
import { publicNavItems } from '../content/navigation.js'

export default function PublicNav() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    const node = wrapRef.current
    if (!node) return undefined
    const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduce) {
      gsap.set(node, { opacity: 1, y: 0 })
      return undefined
    }

    const tween = gsap.fromTo(
      node,
      { opacity: 0, y: -14 },
      { opacity: 1, y: 0, duration: 0.72, delay: 0.08, ease: 'power3.out' },
    )

    return () => tween.kill()
  }, [])

  const closeMobile = () => setMobileOpen(false)

  return (
    <header ref={wrapRef} className="public-nav-wrap">
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
          type="button"
          className="public-nav__menu-button"
          aria-expanded={mobileOpen}
          aria-controls="public-mobile-menu"
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? 'Close' : 'Menu'}
        </button>
      </nav>

      {mobileOpen && (
        <nav id="public-mobile-menu" className="public-mobile-menu" aria-label="Public mobile">
          <div className="public-shell public-mobile-menu__inner">
            {publicNavItems.map((item) => (
              <NavLink key={item.to} to={item.to} onClick={closeMobile}>
                {item.label}
              </NavLink>
            ))}
            <NavLink className="public-mobile-menu__cta" to="/scan" onClick={closeMobile}>
              Start Screening
            </NavLink>
          </div>
        </nav>
      )}
    </header>
  )
}
