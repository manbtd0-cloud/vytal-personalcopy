import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function readPreference() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia(QUERY).matches
}

export default function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(readPreference)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined

    const media = window.matchMedia(QUERY)
    const update = (event) => setReducedMotion(event.matches)

    setReducedMotion(media.matches)
    media.addEventListener?.('change', update)
    if (!media.addEventListener) media.addListener?.(update)

    return () => {
      media.removeEventListener?.('change', update)
      if (!media.removeEventListener) media.removeListener?.(update)
    }
  }, [])

  return reducedMotion
}
