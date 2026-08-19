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
