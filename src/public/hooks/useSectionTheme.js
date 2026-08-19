import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

export default function useSectionTheme(defaultTheme = 'dark') {
  const [theme, setTheme] = useState(defaultTheme)
  const location = useLocation()

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll('[data-public-theme]'))
    if (!sections.length) {
      setTheme(defaultTheme)
      return undefined
    }

    const firstTheme = sections[0]?.dataset.publicTheme || defaultTheme
    setTheme(firstTheme)

    if (typeof IntersectionObserver !== 'function') return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top))

        const next = visible[0]?.target?.dataset?.publicTheme
        if (next) setTheme(next)
      },
      {
        root: null,
        rootMargin: '-24px 0px -82% 0px',
        threshold: [0, 0.01, 1],
      },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [defaultTheme, location.pathname])

  return theme
}
