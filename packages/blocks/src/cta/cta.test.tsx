import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Cta } from './cta'

describe('Cta', () => {
  it('labels the section by its title', () => {
    render(<Cta title="Start building" actions={<button type="button">Go</button>} />)
    expect(screen.getByRole('region', { name: 'Start building' })).toContainElement(
      screen.getByRole('button', { name: 'Go' }),
    )
  })
})
