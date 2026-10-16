import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Stats } from './stats'

describe('Stats', () => {
  it('pairs each value with its label in a description list', () => {
    render(
      <Stats
        items={[
          { label: 'Customers', value: '4,200' },
          { label: 'Uptime', value: '99.99%' },
        ]}
      />,
    )
    expect(screen.getByText('Customers').tagName).toBe('DT')
    expect(screen.getByText('4,200').tagName).toBe('DD')
  })
})
