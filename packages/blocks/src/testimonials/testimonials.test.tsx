import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Testimonials } from './testimonials'

describe('Testimonials', () => {
  it('renders quotes as figures with attribution', () => {
    render(
      <Testimonials
        variant="featured"
        items={[
          { quote: 'Changed how we ship.', author: { name: 'Ada Lovelace', title: 'CTO' } },
          { quote: 'Fast.', author: { name: 'Alan Kay' } },
        ]}
      />,
    )
    expect(screen.getAllByRole('figure')).toHaveLength(2)
    expect(screen.getByText('Changed how we ship.').tagName).toBe('BLOCKQUOTE')
    expect(screen.getByText('CTO')).toBeInTheDocument()
  })
})
