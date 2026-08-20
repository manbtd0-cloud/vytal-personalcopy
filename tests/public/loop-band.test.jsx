import { render, screen, within } from '@testing-library/react'
import { expect, it } from 'vitest'
import LoopBand from '../../src/public/components/system/LoopBand.jsx'
import NumberReveal from '../../src/public/components/system/NumberReveal.jsx'

it('keeps one semantic list while visual loop copies remain hidden from assistive tech', () => {
  const items = ['Heart rate', 'Breathing', 'Pulse variability']
  const { container } = render(
    <LoopBand
      items={items}
      ariaLabel="Vytal screening areas"
      renderItem={(item) => <span>{item}</span>}
    />,
  )

  const list = screen.getByRole('list', { name: 'Vytal screening areas' })
  expect(within(list).getAllByRole('listitem')).toHaveLength(3)
  expect(container.querySelector('[data-loop-band-visual]')).toHaveAttribute('aria-hidden', 'true')
})

it('keeps the final numeric fact available even when animation is only enhancement', () => {
  const { container } = render(<NumberReveal value={8} suffix=" languages" />)
  const number = container.querySelector('[data-number-reveal]')
  expect(number).toHaveAttribute('data-number-final', '8')
  expect(number).toHaveAttribute('aria-label', '8 languages')
})
