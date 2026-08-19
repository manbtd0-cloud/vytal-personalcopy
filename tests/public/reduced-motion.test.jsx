import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import useReducedMotion from '../../src/public/hooks/useReducedMotion.js'

describe('useReducedMotion', () => {
  let matches = false
  let listeners

  beforeEach(() => {
    matches = false
    listeners = new Set()
    window.matchMedia = vi.fn(() => ({
      get matches() {
        return matches
      },
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addEventListener: (type, listener) => {
        if (type === 'change') listeners.add(listener)
      },
      removeEventListener: (type, listener) => {
        if (type === 'change') listeners.delete(listener)
      },
      addListener: (listener) => listeners.add(listener),
      removeListener: (listener) => listeners.delete(listener),
      dispatchEvent: () => false,
    }))
  })

  it('tracks the media query and reacts to preference changes', () => {
    const { result, unmount } = renderHook(() => useReducedMotion())
    expect(result.current).toBe(false)
    expect(listeners.size).toBe(1)

    act(() => {
      matches = true
      listeners.forEach((listener) => listener({ matches: true }))
    })

    expect(result.current).toBe(true)
    unmount()
    expect(listeners.size).toBe(0)
  })
})
