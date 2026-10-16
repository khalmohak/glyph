import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AreaChart, BarChart, DonutChart, LineChart, Sparkline } from './chart'

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
