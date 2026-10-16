import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Timeline, TimelineItem } from './timeline'

describe('Timeline', () => {
  it('renders data-driven items as an ordered list with time elements', () => {
    render(
      <Timeline
        aria-label="Order history"
        items={[
          { title: 'Order placed', time: 'Oct 12', dateTime: '2026-10-12', description: '3 items' },
          { title: 'Shipped', time: 'Oct 13', tone: 'success' },
        ]}
      />,
    )
    const list = screen.getByRole('list', { name: 'Order history' })
    const items = within(list).getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(within(items[0]!).getByText('3 items')).toBeInTheDocument()
    expect(within(items[0]!).getByText('Oct 12')).toHaveAttribute('datetime', '2026-10-12')
    expect(items[1]).toHaveAttribute('data-tone', 'success')
  })

  it('accepts composed TimelineItem children', () => {
    render(
      <Timeline>
        <TimelineItem title="Deployed" icon={<svg data-testid="icon" />}>
          Production is on v2.4.
        </TimelineItem>
      </Timeline>,
    )
    expect(screen.getByText('Production is on v2.4.')).toBeInTheDocument()
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })
})
