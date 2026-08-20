import { render, screen } from '@testing-library/react'
import ScrollReveal from '../../src/public/components/reactbits/ScrollReveal.jsx'
import SplitText from '../../src/public/components/reactbits/SplitText.jsx'

test('retained ReactBits text primitives preserve readable content', () => {
  const { container } = render(
    <>
      <SplitText text="Hidden signal" tag="h2" animateOnMount={false} />
      <ScrollReveal tag="p">Signal context</ScrollReveal>
    </>,
  )

  expect(screen.getByRole('heading', { name: 'Hidden signal' })).toBeInTheDocument()
  expect(container.querySelector('.rb-scroll-reveal')).toHaveTextContent('Signal context')
})
