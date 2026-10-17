import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LineChart } from './cartesian'
import { Heatmap } from './heatmap'
import { PieChart } from './pie'
import { renderChart } from './test-utils'

vi.mock('recharts', (original) => import('./test-utils').then((m) => m.mockRecharts(original)))

const tableCells = (name: string) =>
  within(screen.getByRole('table', { name }))
    .getAllByRole('cell')
    .map((cell) => cell.textContent)

describe('chart regressions', () => {
  it('shows gaps in the data table as a dash, not 0 or NaN', () => {
    renderChart(
      <LineChart
        title="Revenue"
        data={[{ month: 'Jan', revenue: 1200 }, { month: 'Feb', revenue: null }, { month: 'Mar' }]}
        index="month"
        series={[{ key: 'revenue' }]}
      />,
    )
    const cells = tableCells('Revenue')
    expect(cells).not.toContain('NaN')
    expect(cells).toEqual(['1,200', '—', '—'])
  })

  it('shows a pie slice without a value as a dash in the table', () => {
    renderChart(
      <PieChart
        title="Plans"
        data={[
          { plan: 'Free', seats: 10 },
          { plan: 'Pro', seats: undefined },
        ]}
        category="plan"
        value="seats"
      />,
    )
    expect(tableCells('Plans')).toEqual(['10', '—'])
  })

  it('never hides every series when the series list changes', async () => {
    const data = [{ month: 'Jan', a: 1, b: 2, c: 3 }]
    const { rerender } = renderChart(
      <LineChart
        title="Series"
        data={data}
        index="month"
        series={[{ key: 'a' }, { key: 'b' }, { key: 'c' }]}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'b' }))
    await userEvent.click(screen.getByRole('button', { name: 'c' }))
    // The parent drops series "a": "b" and "c" are all that's left, and both were hidden.
    rerender(
      <LineChart title="Series" data={data} index="month" series={[{ key: 'b' }, { key: 'c' }]} />,
    )
    const pressed = screen
      .getAllByRole('button')
      .filter((button) => ['b', 'c'].includes(button.textContent ?? ''))
      .map((button) => button.getAttribute('aria-pressed'))
    expect(pressed).toContain('true')
  })

  it('can hide a series when the hidden list still names one that is gone', async () => {
    const data = [{ month: 'Jan', a: 1, b: 2 }]
    renderChart(
      <LineChart
        title="Series"
        data={data}
        index="month"
        series={[{ key: 'a' }, { key: 'b' }]}
        defaultHiddenSeries={['removed' as 'a']}
      />,
    )
    const a = screen.getByRole('button', { name: 'a' })
    await userEvent.click(a)
    expect(a).toHaveAttribute('aria-pressed', 'false')
  })

  it('shows the pie again when every remaining slice was hidden before the data changed', async () => {
    const { rerender } = renderChart(
      <PieChart
        title="Plans"
        data={[
          { plan: 'Free', seats: 10 },
          { plan: 'Pro', seats: 5 },
          { plan: 'Team', seats: 2 },
        ]}
        category="plan"
        value="seats"
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Pro' }))
    await userEvent.click(screen.getByRole('button', { name: 'Team' }))
    rerender(
      <PieChart
        title="Plans"
        data={[
          { plan: 'Pro', seats: 5 },
          { plan: 'Team', seats: 2 },
        ]}
        category="plan"
        value="seats"
      />,
    )
    expect(screen.getByRole('button', { name: 'Pro' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByText('No data yet')).not.toBeInTheDocument()
  })

  it('skips invalid dates in a heatmap instead of drawing an empty grid', () => {
    const { container } = renderChart(
      <Heatmap
        title="Deploys"
        data={[
          { day: new Date('not a date'), deploys: 3 },
          { day: new Date(2026, 9, 14), deploys: 2 },
        ]}
        date="day"
        value="deploys"
        locale="en-US"
      />,
    )
    expect(container.querySelectorAll('[role="gridcell"]').length).toBeGreaterThan(300)
  })
})
