import { render, screen } from '@testing-library/react'
import SpotlightCard from '../../src/public/components/reactbits/SpotlightCard.jsx'
import PixelTransition from '../../src/public/components/reactbits/PixelTransition.jsx'


test('spotlight card never hides its content', () => {
  render(<SpotlightCard>Signal quality</SpotlightCard>)
  expect(screen.getByText('Signal quality')).toBeVisible()
})

test('controlled pixel transition exposes raw content when inactive', () => {
  render(
    <PixelTransition
      firstContent={<div>RAW_READING</div>}
      secondContent={<div>EXPLAINED_READING</div>}
      active={false}
    />,
  )
  expect(screen.getByText('RAW_READING')).toBeInTheDocument()
})

test('controlled pixel transition exposes explained content when active', () => {
  render(
    <PixelTransition
      firstContent={<div>RAW_READING</div>}
      secondContent={<div>EXPLAINED_READING</div>}
      active
    />,
  )
  expect(screen.getByText('EXPLAINED_READING')).toBeInTheDocument()
})
