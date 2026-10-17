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
    expect(screen.getByText('4,200').closest('dd')).not.toBeNull()
  })

  it('keeps prefixes, suffixes, grouping and decimals of numeric values', () => {
    render(
      <Stats
        items={[
          { label: 'Revenue', value: '$48,210' },
          { label: 'Rating', value: '4.9/5' },
          { label: 'Region', value: 'EU and US' },
        ]}
      />,
    )
    expect(screen.getByText('48,210').closest('dd')).toHaveTextContent('$48,210')
    expect(screen.getByText('4.9').closest('dd')).toHaveTextContent('4.9/5')
    expect(screen.getByText('EU and US').tagName).toBe('DD')
  })

  it('always ends on exactly the value it was given', () => {
    const values = ['007', '00:05', '.5', '1,2,3', '24/7', '1.2M', '-5%', '+40%']
    render(<Stats items={values.map((value, i) => ({ label: `Stat ${i}`, value }))} />)
    for (const [i, value] of values.entries()) {
      expect(screen.getByText(`Stat ${i}`).nextElementSibling).toHaveTextContent(value, {
        normalizeWhitespace: false,
      })
    }
  })

  it('renders plain values when animation is off', () => {
    render(<Stats animate={false} items={[{ label: 'Customers', value: '4,200' }]} />)
    expect(screen.getByText('4,200').tagName).toBe('DD')
  })
})
