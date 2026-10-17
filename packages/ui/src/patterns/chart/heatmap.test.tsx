import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Heatmap, type HeatmapProps } from './heatmap'
import { renderChart } from './test-utils'

const data = [
  { day: '2026-10-01', deploys: 2 },
  { day: '2026-10-08', deploys: 8 },
  { day: '2026-10-09', deploys: 4 },
  { day: '2026-10-14', deploys: 1 },
]

function setup(extra: Partial<HeatmapProps<(typeof data)[number]>> = {}) {
  return renderChart(
    <Heatmap
      title="Deploys"
      data={data}
      date="day"
      value="deploys"
      unit="deploys"
      from={new Date(2026, 8, 1)}
      to={new Date(2026, 9, 14)}
      locale="en-US"
      {...extra}
    />,
  )
}

describe('Heatmap', () => {
  it('renders a grid with one labelled cell per day', () => {
    setup()
    const grid = screen.getByRole('grid', { name: 'Deploys' })
    // Sep 1 to Oct 14 inclusive.
    expect(screen.getAllByRole('gridcell')).toHaveLength(44)
    expect(screen.getAllByRole('row')).toHaveLength(7)
    expect(grid).toBeInTheDocument()
    expect(screen.getByRole('gridcell', { name: '8 deploys on Thu, Oct 8, 2026' })).toHaveAttribute(
      'data-level',
      '4',
    )
    expect(screen.getByRole('gridcell', { name: '0 deploys on Tue, Sep 1, 2026' })).toHaveAttribute(
      'data-level',
      '0',
    )
  })

  it('has a single tab stop on the last day and moves with the arrow keys', async () => {
    const user = userEvent.setup()
    setup()
    await user.tab()
    expect(document.activeElement).toHaveAttribute('data-day', '2026-10-14')
    await user.keyboard('{ArrowLeft}')
    expect(document.activeElement).toHaveAttribute('data-day', '2026-10-7')
    await user.keyboard('{ArrowUp}')
    expect(document.activeElement).toHaveAttribute('data-day', '2026-10-6')
    await user.keyboard('{ArrowDown}{ArrowDown}')
    expect(document.activeElement).toHaveAttribute('data-day', '2026-10-8')
    await user.keyboard('{Home}')
    expect(document.activeElement).toHaveAttribute('data-day', '2026-9-1')
    await user.keyboard('{ArrowLeft}')
    // Stays put at the edge of the range.
    expect(document.activeElement).toHaveAttribute('data-day', '2026-9-1')
    await user.keyboard('{End}')
    expect(document.activeElement).toHaveAttribute('data-day', '2026-10-14')
    expect(
      screen.getAllByRole('gridcell').filter((cell) => cell.getAttribute('tabindex') === '0'),
    ).toHaveLength(1)
  })

  it('shows a tooltip for the hovered day and reports clicks', async () => {
    const user = userEvent.setup()
    const onCellClick = vi.fn()
    setup({ onCellClick })
    const cell = screen.getByRole('gridcell', { name: '4 deploys on Fri, Oct 9, 2026' })
    fireEvent.mouseEnter(cell)
    expect(document.querySelector('[data-slot=chart-tooltip]')).toHaveTextContent('4 deploys')
    await user.click(cell)
    expect(onCellClick).toHaveBeenCalledWith(new Date(2026, 9, 9), 4)
    cell.focus()
    await user.keyboard('{Enter}')
    expect(onCellClick).toHaveBeenCalledTimes(2)
  })

  it('can start weeks on Monday', () => {
    setup({ weekStart: 1 })
    // Monday Sep 7 sits in the first row when weeks start on Monday.
    const firstRow = screen.getAllByRole('row')[0]!
    expect(firstRow.querySelector('[data-day="2026-9-7"]')).not.toBeNull()
  })
})
