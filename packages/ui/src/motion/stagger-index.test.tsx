import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Stagger, StaggerItem } from './stagger'

// Relay finding U7: StaggerItem required `index`, which is easy to get wrong.
describe('StaggerItem', () => {
  it('takes its place in the cascade from document order when no index is given', () => {
    render(
      <Stagger>
        <div>
          <StaggerItem>
            <p>First</p>
          </StaggerItem>
          <StaggerItem>
            <p>Second</p>
          </StaggerItem>
        </div>
      </Stagger>,
    )
    expect(screen.getByText('First').style.getPropertyValue('--glyph-stagger-index')).toBe('0')
    expect(screen.getByText('Second').style.getPropertyValue('--glyph-stagger-index')).toBe('1')
  })

  it('keeps an explicit index', () => {
    render(
      <Stagger asChild>
        <ul>
          <StaggerItem index={4}>
            <li>Fifth</li>
          </StaggerItem>
        </ul>
      </Stagger>,
    )
    expect(screen.getByText('Fifth').style.getPropertyValue('--glyph-stagger-index')).toBe('4')
  })
})
