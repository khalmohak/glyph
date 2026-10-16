import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Blockquote } from './blockquote'

describe('Blockquote', () => {
  it('renders the quote with its attribution', () => {
    render(
      <Blockquote author="Dieter Rams" source="Ten principles" citeUrl="https://example.com">
        Less, but better.
      </Blockquote>,
    )
    const quote = screen.getByText('Less, but better.')
    expect(quote.tagName).toBe('BLOCKQUOTE')
    expect(quote).toHaveAttribute('cite', 'https://example.com')
    expect(screen.getByText('Dieter Rams').tagName).toBe('CITE')
    expect(screen.getByText(/Ten principles/)).toBeInTheDocument()
  })

  it('omits the caption without author or source', () => {
    const { container } = render(<Blockquote>Quiet.</Blockquote>)
    expect(container.querySelector('figcaption')).toBeNull()
  })
})
