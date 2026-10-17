import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AreaChart, BarChart, DonutChart, LineChart, Sparkline } from './chart'
import { resolveColor } from './chart-parts'

const data = [
  { month: 'Jan', revenue: 1200, costs: 800 },
  { month: 'Feb', revenue: 1800, costs: 900 },
]
const series = [
  { key: 'revenue', label: 'Revenue' },
  { key: 'costs', label: 'Costs', color: 'danger' },
] as const

describe('charts', () => {
  it('renders a captioned figure with an accessible data table', () => {
    render(
      <LineChart
        title="Revenue and costs"
        data={data}
        index="month"
        series={series}
        valueFormatter={(v) => `$${v}`}
      />,
    )
    const figure = screen.getByRole('figure', { name: 'Revenue and costs' })
    const table = within(figure).getByRole('table', { name: 'Revenue and costs' })
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((th) => th.textContent),
    ).toEqual(['month', 'Revenue', 'Costs'])
    expect(within(table).getByRole('rowheader', { name: 'Feb' })).toBeInTheDocument()
    expect(within(table).getByText('$1800')).toBeInTheDocument()
  })

  it('shows a legend for multiple series and hides it for one', () => {
    const { container, rerender } = render(
      <AreaChart title="Traffic" data={data} index="month" series={series} />,
    )
    const legend = container.querySelector('[data-slot=chart-legend]')
    expect(legend).toHaveTextContent('Revenue')
    expect(legend).toHaveTextContent('Costs')
    rerender(
      <BarChart
        title="Revenue"
        data={data}
        index="month"
        series={[{ key: 'revenue', label: 'Revenue' }]}
      />,
    )
    expect(container.querySelector('[data-slot=chart-legend]')).toBeNull()
  })

  it('renders a donut with its center label and slice table', () => {
    render(
      <DonutChart
        title="Plan mix"
        data={[
          { plan: 'Free', users: 60 },
          { plan: 'Pro', users: 40 },
        ]}
        category="plan"
        value="users"
        centerLabel={<span>100 users</span>}
      />,
    )
    expect(screen.getByText('100 users')).toBeInTheDocument()
    expect(screen.getByRole('rowheader', { name: 'Pro' })).toBeInTheDocument()
  })

  it('labels sparklines as images', () => {
    render(<Sparkline title="Signups, rising" values={[1, 3, 2, 5]} />)
    expect(screen.getByRole('img', { name: 'Signups, rising' })).toBeInTheDocument()
  })
})

describe('chart colors', () => {
  it('defaults series to the theme chart palette, in order', () => {
    expect([0, 1, 4, 5].map((i) => resolveColor(undefined, i))).toEqual([
      'var(--color-chart-1)',
      'var(--color-chart-2)',
      'var(--color-chart-5)',
      'var(--color-chart-1)',
    ])
  })

  it('accepts theme color names and raw CSS colors', () => {
    expect(resolveColor('success', 0)).toBe('var(--color-success)')
    expect(resolveColor('chart-3', 0)).toBe('var(--color-chart-3)')
    expect(resolveColor('#ff0066', 0)).toBe('#ff0066')
    expect(resolveColor('oklch(70% 0.1 200)', 0)).toBe('oklch(70% 0.1 200)')
  })
})
