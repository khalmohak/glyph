import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Heading } from './index'

describe('Heading wrapping', () => {
  it('breaks a single long word instead of overflowing narrow screens', () => {
    render(<Heading level={1}>Supercalifragilisticexpialidocious</Heading>)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading.className).toMatch(/(^|\s)break-words(\s|$)/)
    expect(heading.className).toMatch(/(^|\s)hyphens-auto(\s|$)/)
  })
})
