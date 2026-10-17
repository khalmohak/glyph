import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FunnelChart } from './funnel'
import { DonutChart, PieChart } from './pie'
import { Gauge, RadarChart, RadialBarChart } from './radial'
import { SankeyChart } from './sankey'
import { ScatterChart } from './scatter'
import { Sparkline } from './sparkline'
import { renderChart } from './test-utils'
import { Treemap } from './treemap'

vi.mock('recharts', (original) => import('./test-utils').then((m) => m.mockRecharts(original)))

const plans = [
  { plan: 'Free', seats: 60 },
  { plan: 'Pro', seats: 30 },
  { plan: 'Team', seats: 10 },
]

const sectors = (container: HTMLElement) =>
  container.querySelectorAll('.recharts-pie-sector').length

describe('PieChart and DonutChart', () => {
  it('renders slices, a slice table and the donut center label', () => {
    const { container } = renderChart(
      <DonutChart
        title="Plan mix"
        data={plans}
        category="plan"
        value="seats"
        centerLabel={<span>100 seats</span>}
      />,
    )
    expect(sectors(container)).toBe(3)
    expect(screen.getByText('100 seats')).toBeInTheDocument()
    expect(screen.getByRole('rowheader', { name: 'Pro' })).toBeInTheDocument()
  })

  it('hides a slice from the legend', async () => {
    const user = userEvent.setup()
    const { container } = renderChart(
      <PieChart title="Plan mix" data={plans} category="plan" value="seats" />,
    )
    await user.click(screen.getByRole('button', { name: 'Team' }))
    expect(sectors(container)).toBe(2)
    expect(screen.getByRole('button', { name: 'Team' })).toHaveAttribute('aria-pressed', 'false')
    // The table still lists every slice.
    expect(screen.getByRole('rowheader', { name: 'Team' })).toBeInTheDocument()
  })

  it('labels slices with their share', () => {
    renderChart(
      <PieChart title="Plan mix" data={plans} category="plan" value="seats" labels="percent" />,
    )
    expect(screen.getByText('60%')).toBeInTheDocument()
    expect(screen.getByText('10%')).toBeInTheDocument()
  })

  it('shows the empty state when every value is zero', () => {
    renderChart(
      <PieChart
        title="Plan mix"
        data={[{ plan: 'Free', seats: 0 }]}
        category="plan"
        value="seats"
      />,
    )
    expect(screen.getByText('No data yet')).toBeInTheDocument()
  })
})

describe('RadarChart and RadialBarChart', () => {
  it('draws one radar per series', () => {
    const { container } = renderChart(
      <RadarChart
        title="Plan scores"
        data={[
          { skill: 'Speed', pro: 8, team: 6 },
          { skill: 'Support', pro: 6, team: 9 },
          { skill: 'Price', pro: 7, team: 5 },
        ]}
        index="skill"
        series={[
          { key: 'pro', label: 'Pro' },
          { key: 'team', label: 'Team' },
        ]}
      />,
    )
    expect(container.querySelectorAll('.recharts-radar').length).toBe(2)
    expect(screen.getByRole('button', { name: 'Team' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('lists radial bars in its table', () => {
    renderChart(
      <RadialBarChart
        title="Goals"
        data={[
          { goal: 'Signups', done: 80 },
          { goal: 'Revenue', done: 64 },
        ]}
        category="goal"
        value="done"
        max={100}
        valueFormatter={(v) => `${v}%`}
      />,
    )
    const table = screen.getByRole('table', { name: 'Goals' })
    expect(within(table).getByText('64%')).toBeInTheDocument()
  })
})

describe('Gauge', () => {
  it('is a meter whose text names the band', () => {
    renderChart(
      <Gauge
        title="p95 latency"
        value={240}
        max={600}
        valueFormatter={(v) => `${v} ms`}
        bands={[
          { to: 200, color: 'success', label: 'Healthy' },
          { to: 400, color: 'warning', label: 'Slow' },
          { to: 600, color: 'danger', label: 'Failing' },
        ]}
      />,
    )
    const meter = screen.getByRole('meter', { name: 'p95 latency' })
    expect(meter).toHaveAttribute('aria-valuenow', '240')
    expect(meter).toHaveAttribute('aria-valuemax', '600')
    expect(meter).toHaveAttribute('aria-valuetext', '240 ms, Slow')
    expect(screen.getByText('Slow')).toBeInTheDocument()
  })

  it('clamps the arc to the range', () => {
    const { container } = renderChart(<Gauge title="Quota" value={150} max={100} />)
    const arc = container.querySelector('[data-slot=gauge-value]')!
    expect(Number(arc.getAttribute('stroke-dashoffset'))).toBe(0)
  })
})

describe('ScatterChart', () => {
  const accounts = [
    { name: 'Northwind', seats: 40, mrr: 1200, segment: 'SMB' },
    { name: 'Globex', seats: 220, mrr: 8200, segment: 'Enterprise' },
    { name: 'Hooli', seats: 300, mrr: 12900, segment: 'Enterprise' },
  ]

  it('groups points with a legend and a table', async () => {
    const user = userEvent.setup()
    const { container } = renderChart(
      <ScatterChart
        title="Seats vs MRR"
        data={accounts}
        x="seats"
        y="mrr"
        name="name"
        groupBy="segment"
        xAxis={{ label: 'Seats' }}
        yAxis={{ label: 'MRR' }}
      />,
    )
    expect(container.querySelectorAll('.recharts-scatter-symbol').length).toBe(3)
    const table = screen.getByRole('table', { name: 'Seats vs MRR' })
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((th) => th.textContent),
    ).toEqual(['name', 'segment', 'Seats', 'MRR'])
    await user.click(screen.getByRole('button', { name: 'SMB' }))
    expect(container.querySelectorAll('.recharts-scatter-symbol').length).toBe(2)
  })
})

describe('FunnelChart', () => {
  it('shows each stage with its conversion', () => {
    renderChart(
      <FunnelChart
        title="Signup funnel"
        data={[
          { stage: 'Visited', people: 1000 },
          { stage: 'Signed up', people: 250 },
          { stage: 'Paid', people: 50 },
        ]}
        category="stage"
        value="people"
      />,
    )
    const table = screen.getByRole('table', { name: 'Signup funnel' })
    expect(within(table).getByText('25%')).toBeInTheDocument()
    expect(within(table).getByText('20%')).toBeInTheDocument()
    expect(screen.getByText('20% converted')).toBeInTheDocument()
  })

  it('can measure against the first stage', () => {
    renderChart(
      <FunnelChart
        title="Signup funnel"
        data={[
          { stage: 'Visited', people: 1000 },
          { stage: 'Paid', people: 50 },
        ]}
        category="stage"
        value="people"
        conversion="first"
      />,
    )
    expect(screen.getByRole('columnheader', { name: '% of first' })).toBeInTheDocument()
    expect(screen.getByText('5% of total')).toBeInTheDocument()
  })
})

describe('Treemap', () => {
  it('draws a tile per row and colors groups', () => {
    const { container } = renderChart(
      <Treemap
        title="Spend"
        data={[
          { vendor: 'AWS', team: 'Platform', cost: 42000 },
          { vendor: 'Datadog', team: 'Platform', cost: 9000 },
          { vendor: 'Figma', team: 'Design', cost: 3000 },
        ]}
        category="vendor"
        value="cost"
        group="team"
      />,
    )
    expect(container.querySelectorAll('.recharts-treemap-depth-2').length).toBe(3)
    expect(container.querySelector('[data-slot=chart-legend]')).toHaveTextContent('Design')
    expect(screen.getByRole('rowheader', { name: 'Datadog' })).toBeInTheDocument()
  })
})

describe('SankeyChart', () => {
  it('draws nodes and links from named flows', () => {
    const { container } = renderChart(
      <SankeyChart
        title="Traffic"
        links={[
          { source: 'Search', target: 'Pricing', value: 400 },
          { source: 'Social', target: 'Pricing', value: 120 },
          { source: 'Pricing', target: 'Signup', value: 180 },
        ]}
      />,
    )
    expect(container.querySelectorAll('.recharts-sankey-nodes rect').length).toBe(4)
    expect(container.querySelectorAll('.recharts-sankey-links path').length).toBe(3)
    expect(screen.getByRole('table', { name: 'Traffic' })).toHaveTextContent('Social')
  })
})

describe('Sparkline', () => {
  it('draws bars and marks the extremes', () => {
    const { container, rerender } = renderChart(
      <Sparkline title="Signups, rising" values={[3, 1, 4, 9, 2]} showMinMax variant="line" />,
    )
    expect(screen.getByRole('img', { name: 'Signups, rising' })).toHaveAttribute(
      'data-variant',
      'line',
    )
    expect(container.querySelector('[data-extreme=max]')).not.toBeNull()
    expect(container.querySelector('[data-extreme=min]')).not.toBeNull()
    rerender(<Sparkline title="Signups" values={[3, 1, 4]} variant="bar" />)
    expect(container.querySelectorAll('.recharts-bar-rectangle').length).toBe(3)
  })

  it('keeps the legacy area prop working', () => {
    renderChart(<Sparkline title="Trend" values={[1, 2]} area={false} />)
    expect(screen.getByRole('img', { name: 'Trend' })).toHaveAttribute('data-variant', 'line')
  })
})
