import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Grid } from './grid'

describe('Grid', () => {
  it('maps a column count to a class', () => {
    render(<Grid cols={3}>cells</Grid>)
    expect(screen.getByText('cells').className).toContain('grid-cols-3')
  })

  it('maps responsive columns and gap', () => {
    render(
      <Grid cols={{ base: 1, sm: 2, lg: 4 }} gap={8}>
        cells
      </Grid>,
    )
    const cls = screen.getByText('cells').className
    expect(cls).toContain('grid-cols-1')
    expect(cls).toContain('sm:grid-cols-2')
    expect(cls).toContain('lg:grid-cols-4')
    expect(cls).toContain('gap-8')
  })
})
