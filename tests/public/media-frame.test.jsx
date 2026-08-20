import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import MediaFrame from '../../src/public/components/system/MediaFrame.jsx'

const placeholder = {
  id: 'TEST-SLOT',
  kind: 'image',
  ratio: '4 / 3',
  src: null,
  poster: null,
  alt: '',
  caption: '',
  objectPosition: '50% 50%',
  reveal: 'fade',
  parallax: false,
  priority: 'low',
  status: 'placeholder',
}

it('preserves a production media slot when source is absent', () => {
  const { container } = render(<MediaFrame slot={placeholder} />)
  const frame = container.querySelector('[data-media-slot="TEST-SLOT"]')
  expect(frame).toBeInTheDocument()
  expect(frame).toHaveAttribute('data-media-status', 'placeholder')
  expect(frame).toHaveStyle({ aspectRatio: '4 / 3' })
  expect(container.querySelector('img')).toBeNull()
  expect(container.querySelector('video')).toBeNull()
})

it('renders a real image while preserving the same frame contract', () => {
  const real = { ...placeholder, src: '/test.jpg', alt: 'Test media', status: 'final' }
  const { container } = render(<MediaFrame slot={real} />)
  expect(screen.getByRole('img', { name: 'Test media' })).toHaveAttribute('src', '/test.jpg')
  expect(container.querySelector('[data-media-slot="TEST-SLOT"]')).toHaveAttribute('data-media-status', 'final')
})

it('plays real video only while visible and pauses it again offscreen', () => {
  const originalIntersectionObserver = globalThis.IntersectionObserver
  const observers = []

  globalThis.IntersectionObserver = class {
    constructor(callback) {
      this.callback = callback
      this.observe = vi.fn()
      this.disconnect = vi.fn()
      observers.push(this)
    }
  }

  const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve())
  const pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
  const videoSlot = {
    ...placeholder,
    id: 'TEST-VIDEO',
    kind: 'video',
    src: '/test.mp4',
    poster: '/poster.jpg',
    alt: 'Ambient screening footage',
    status: 'final',
  }

  const { container, unmount } = render(<MediaFrame slot={videoSlot} />)
  const video = container.querySelector('video')

  expect(video).toBeInTheDocument()
  expect(video).not.toHaveAttribute('autoplay')
  expect(observers).toHaveLength(1)
  expect(observers[0].observe).toHaveBeenCalledWith(video)
  expect(play).not.toHaveBeenCalled()

  observers[0].callback([{ target: video, isIntersecting: true }])
  expect(play).toHaveBeenCalledTimes(1)

  observers[0].callback([{ target: video, isIntersecting: false }])
  expect(pause).toHaveBeenCalledTimes(1)

  unmount()
  expect(observers[0].disconnect).toHaveBeenCalledTimes(1)
  expect(pause).toHaveBeenCalledTimes(2)

  play.mockRestore()
  pause.mockRestore()
  globalThis.IntersectionObserver = originalIntersectionObserver
})
