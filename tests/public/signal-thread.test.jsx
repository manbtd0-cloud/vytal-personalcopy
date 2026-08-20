import { render } from '@testing-library/react'
import { expect, it } from 'vitest'
import SignalThread from '../../src/public/components/system/SignalThread.jsx'

it('renders deterministic semantic signal states without exposing decorative SVG to assistive tech', () => {
  const { container, rerender } = render(
    <SignalThread variant="raw" tone="coral" direction="horizontal" density="normal" decorative />,
  )

  const thread = container.querySelector('[data-signal-thread]')
  expect(thread).toBeInTheDocument()
  expect(thread).toHaveAttribute('data-signal-variant', 'raw')
  expect(thread).toHaveAttribute('data-signal-tone', 'coral')
  expect(thread).toHaveAttribute('aria-hidden', 'true')
  expect(container.querySelectorAll('[data-spectral-sample]').length).toBeGreaterThan(0)

  rerender(
    <SignalThread variant="trusted" tone="mint" direction="horizontal" density="quiet" decorative />,
  )

  expect(container.querySelector('[data-signal-thread]')).toHaveAttribute('data-signal-variant', 'trusted')
  expect(container.querySelector('[data-signal-thread]')).toHaveAttribute('data-signal-tone', 'mint')
})
