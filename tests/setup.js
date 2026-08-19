import '@testing-library/jest-dom'
import { afterEach } from 'vitest'

if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return false
    },
  })
}

Object.defineProperty(window, 'scrollTo', {
  configurable: true,
  writable: true,
  value: () => {},
})

const pendingAnimationFrames = new Set()

if (!globalThis.requestAnimationFrame) {
  globalThis.requestAnimationFrame = (callback) => {
    const id = setTimeout(() => {
      pendingAnimationFrames.delete(id)
      callback(Date.now())
    }, 16)

    pendingAnimationFrames.add(id)
    return id
  }
}

if (!globalThis.cancelAnimationFrame) {
  globalThis.cancelAnimationFrame = (id) => {
    pendingAnimationFrames.delete(id)
    clearTimeout(id)
  }
}

afterEach(() => {
  for (const id of pendingAnimationFrames) {
    clearTimeout(id)
  }
  pendingAnimationFrames.clear()
})
