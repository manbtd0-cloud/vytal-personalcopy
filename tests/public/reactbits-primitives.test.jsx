import { render, screen } from '@testing-library/react'
import ScrollReveal from '../../src/public/components/reactbits/ScrollReveal.jsx'
import SplitText from '../../src/public/components/reactbits/SplitText.jsx'

test('retained ReactBits text primitives preserve readable content', () => {
  render(
    <>
      <SplitText text="Hidden signal" tag="h2" animateOnMount={false} />
      <ScrollReveal tag="p">Signal context</ScrollReveal>
    </>,
  )

  expect(screen.getByRole('heading', { name: 'Hidden signal' })).toBeInTheDocument()
  expect(screen.getByText('Signal context')).toBeInTheDocument()
})
