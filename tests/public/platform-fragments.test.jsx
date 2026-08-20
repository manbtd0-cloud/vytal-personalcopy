import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PlatformPage from '../../src/public/pages/PlatformPage.jsx'
import { platformFragments } from '../../src/public/content/platform.js'
import { getMediaSlotById } from '../../src/public/content/mediaSlots.js'

const expectedFragments = [
  ['camera', 'Current / core direction', 'PLT-FRAG-CAMERA-01'],
  ['ble', 'Future integration', 'PLT-FRAG-BLE-01'],
  ['wearable', 'Future integration', 'PLT-FRAG-WEARABLE-01'],
  ['thermal', 'Future / research direction', 'PLT-FRAG-THERMAL-01'],
  ['records', 'Prototype / current direction', 'PLT-FRAG-RECORD-01'],
  ['language', 'Current capability', 'PLT-FRAG-LANGUAGE-01'],
  ['referral', 'Workflow direction', 'PLT-FRAG-REFERRAL-01'],
  ['population', 'Research direction', 'PLT-FRAG-POPULATION-01'],
]

test('Platform keeps eight sensing and context fragments distinct with canonical maturity labels', () => {
  expect(platformFragments.map(({ id, status, mediaSlotId }) => [id, status, mediaSlotId])).toEqual(
    expectedFragments,
  )

  const { container } = render(
    <MemoryRouter>
      <PlatformPage />
    </MemoryRouter>,
  )

  expect(screen.getByRole('heading', { level: 1, name: /one signal is a fragment/i })).toBeInTheDocument()

  const field = container.querySelector('[data-platform-fragments]')
  expect(field).toBeInTheDocument()
  expect(field.querySelector('.platform-fragment-grid')).not.toBeInTheDocument()

  const rendered = Array.from(field.querySelectorAll('[data-platform-fragment]'))
  expect(rendered).toHaveLength(platformFragments.length)

  platformFragments.forEach((fragment, index) => {
    const item = rendered[index]
    expect(item).toHaveAttribute('data-platform-fragment', fragment.id)
    expect(item).toHaveAttribute('data-platform-status', fragment.status)
    expect(within(item).getByRole('heading', { name: fragment.title })).toBeInTheDocument()
    expect(within(item).getByText(fragment.status)).toBeInTheDocument()
    expect(within(item).getByText(fragment.body)).toBeInTheDocument()
    expect(getMediaSlotById(fragment.mediaSlotId)).not.toBeNull()
    expect(item.querySelector(`[data-media-slot="${fragment.mediaSlotId}"]`)).toBeInTheDocument()
  })
})

test('Platform assembly connects the fragments with a NETWORK signal thread and canonical assembled frame', () => {
  const { container } = render(
    <MemoryRouter>
      <PlatformPage />
    </MemoryRouter>,
  )

  const assembly = container.querySelector('[data-platform-assembly]')
  expect(assembly).toBeInTheDocument()
  expect(
    assembly.querySelector('[data-signal-thread][data-signal-variant="network"]'),
  ).toBeInTheDocument()
  expect(assembly.querySelector('[data-media-slot="PLT-ASSEMBLED-01"]')).toBeInTheDocument()

  for (const fragment of platformFragments) {
    expect(within(assembly).getByText(fragment.shortLabel)).toBeInTheDocument()
  }
})

test('Platform makes the future boundary explicit before product entry', () => {
  const { container } = render(
    <MemoryRouter>
      <PlatformPage />
    </MemoryRouter>,
  )

  const notice = container.querySelector('[data-platform-future-notice]')
  expect(notice).toBeInTheDocument()
  expect(within(notice).getByText(/future integrations are not current production support/i)).toBeInTheDocument()
  expect(within(notice).getByText(/camera remains the current core direction/i)).toBeInTheDocument()

  const close = container.querySelector('[data-platform-close]')
  expect(close).toBeInTheDocument()
  expect(within(close).getByRole('link', { name: /start screening/i })).toHaveAttribute('href', '/scan')
  expect(within(close).getByRole('link', { name: /explore screenings/i })).toHaveAttribute(
    'href',
    '/screenings',
  )
})
