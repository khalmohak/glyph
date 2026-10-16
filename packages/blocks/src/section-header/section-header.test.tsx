import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SectionHeader } from './section-header'

describe('SectionHeader', () => {
  it('renders title at the given level with id', () => {
    render(<SectionHeader eyebrow="Why" title="Built to last" headingLevel={3} titleId="t" />)
    const heading = screen.getByRole('heading', { level: 3, name: 'Built to last' })
    expect(heading).toHaveAttribute('id', 't')
    expect(screen.getByText('Why')).toBeInTheDocument()
  })
})
