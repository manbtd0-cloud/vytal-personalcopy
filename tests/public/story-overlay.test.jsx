import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { impactScenarios } from '../../src/public/content/impact.js'
import StoryOverlay from '../../src/public/components/system/StoryOverlay.jsx'

const expectedIds = [
  'individual-home',
  'community-health-worker',
  'low-connectivity',
  'multilingual-explanation',
  'longitudinal-follow-up',
  'referral-continuity',
]

test('impact scenarios stay illustrative and map to three production media slots each', () => {
  expect(impactScenarios.map((scenario) => scenario.id)).toEqual(expectedIds)

  for (const scenario of impactScenarios) {
    expect(scenario.illustrative).toBe(true)
    expect(scenario.mediaSlotIds).toHaveLength(3)
    expect(scenario.mediaSlotIds.every((id) => typeof id === 'string' && id.length > 0)).toBe(true)
  }
})

function OverlayHarness() {
  const [selectedId, setSelectedId] = useState(null)
  const selected = impactScenarios.find((scenario) => scenario.id === selectedId) ?? null

  return (
    <>
      <button type="button" onClick={() => setSelectedId('individual-home')}>
        Open story
      </button>
      <StoryOverlay
        scenario={selected}
        scenarios={impactScenarios}
        onSelect={setSelectedId}
        onClose={() => setSelectedId(null)}
      />
    </>
  )
}

test('story overlay behaves like one focus-safe navigable dialog', () => {
  render(<OverlayHarness />)

  const opener = screen.getByRole('button', { name: /open story/i })
  opener.focus()
  fireEvent.click(opener)

  expect(screen.getByRole('dialog')).toBeInTheDocument()
  expect(document.body.style.overflow).toBe('hidden')
  expect(screen.getByRole('button', { name: /close story/i })).toHaveFocus()
  expect(screen.getByText(/illustrative scenario/i)).toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: /next story/i }))
  expect(screen.getByRole('heading', { name: /community health worker/i })).toBeInTheDocument()

  const nextButton = screen.getByRole('button', { name: /next story/i })
  nextButton.focus()
  fireEvent.keyDown(document, { key: 'Tab' })
  expect(screen.getByRole('button', { name: /close story/i })).toHaveFocus()

  fireEvent.keyDown(document, { key: 'Escape' })
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(document.body.style.overflow).toBe('')
  expect(opener).toHaveFocus()
})
