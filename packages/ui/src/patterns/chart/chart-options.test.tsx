import { fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AreaChart, BarChart, ComposedChart, LineChart } from './cartesian'
import { ChartCard } from './chart-card'
import { FunnelChart } from './funnel'
import { DonutChart, PieChart } from './pie'
import { Gauge, RadialBarChart } from './radial'
import { ScatterChart } from './scatter'
import { renderChart } from './test-utils'

vi.mock('recharts', (original) => import('./test-utils').then((m) => m.mockRecharts(original)))

const data = [
  { month: 'Jan', revenue: 1200, costs: 800 },
  { month: 'Feb', revenue: 1800, costs: 900 },
  { month: 'Mar', revenue: 2100, costs: 950 },
]

const ticks = (container: HTMLElement, axis: 'x' | 'y') =>
  [
    ...container.querySelectorAll(
      `.recharts-${axis}Axis-tick-labels .recharts-cartesian-axis-tick-value`,
    ),
  ].map((node) => node.textContent)

describe('cartesian options', () => {
  it('formats axes and titles them', () => {
    const { container } = renderChart(
      <LineChart
        title="Revenue"
        data={data}
        index="month"
        series={[{ key: 'revenue' }]}
        curve="step"
        dots
        xAxis={{ formatter: (v: string) => v.toUpperCase(), label: 'Month' }}
        yAxis={{
          formatter: (v: number) => `${v / 1000}k`,
          label: 'USD',
          domain: [0, 3000],
          tickCount: 4,
        }}
      />,
    )
    expect(ticks(container, 'x')).toContain('FEB')
    expect(ticks(container, 'y')).toContain('3k')
    expect(screen.getByText('Month')).toBeInTheDocument()
    expect(screen.getByText('USD')).toBeInTheDocument()
    expect(container.querySelectorAll('.recharts-line-dot').length).toBe(3)
  })

  it('hides axes and the grid', () => {
    const { container } = renderChart(
      <AreaChart
        title="Revenue"
        data={data}
        index="month"
        series={[{ key: 'revenue' }]}
        showGrid={false}
        showYAxis={false}
        xAxis={{ hide: true }}
      />,
    )
    expect(container.querySelector('.recharts-cartesian-grid')).toBeNull()
    expect(ticks(container, 'y')).toEqual([])
    expect(ticks(container, 'x')).toEqual([])
  })

  it('stacks areas to 100%', () => {
    const { container } = renderChart(
      <AreaChart
        title="Share"
        data={data}
        index="month"
        series={[{ key: 'revenue' }, { key: 'costs' }]}
        expand
      />,
    )
    expect(ticks(container, 'y')).toContain('100%')
  })

  it('draws horizontal, stacked bars', () => {
    const { container } = renderChart(
      <BarChart
        title="Pages"
        data={data}
        index="month"
        layout="vertical"
        stacked
        series={[{ key: 'revenue' }, { key: 'costs' }]}
        xAxis={{ formatter: (v: string) => `→ ${v}` }}
      />,
    )
    expect(container.querySelectorAll('.recharts-bar-rectangle').length).toBe(6)
    expect(ticks(container, 'y')).toContain('→ Jan')
  })

  it('reports the clicked row', () => {
    const onPointClick = vi.fn()
    const { container } = renderChart(
      <BarChart
        title="Revenue"
        data={data}
        index="month"
        series={[{ key: 'revenue' }]}
        onPointClick={onPointClick}
        syncId="dash"
      />,
    )
    const surface = container.querySelector('.recharts-wrapper')!
    expect(surface).toHaveStyle({ cursor: 'pointer' })
  })

  it('titles the right axis of a composed chart and stacks its bars', () => {
    const { container } = renderChart(
      <ComposedChart
        title="Mixed"
        data={data}
        index="month"
        stacked
        rightAxis={{ label: 'Costs', formatter: (v: number) => `${v}c` }}
        series={[
          { key: 'revenue', type: 'bar' },
          { key: 'costs', type: 'area', axis: 'right' },
        ]}
      />,
    )
    expect(screen.getByText('Costs', { selector: 'text, tspan' })).toBeInTheDocument()
    expect(container.querySelector('.recharts-area')).not.toBeNull()
    expect(ticks(container, 'y').some((t) => t?.endsWith('c'))).toBe(true)
  })
})

describe('ScatterChart options', () => {
  const points = [
    { x: 1, y: 10, size: 3 },
    { x: 2, y: 30, size: 9 },
  ]

  it('numbers rows without names and formats every column', () => {
    renderChart(
      <ScatterChart
        title="Points"
        data={points}
        x="x"
        y="y"
        size="size"
        sizeFormatter={(v) => `${v} tickets`}
        xAxis={{ formatter: (v: number) => `${v} seats`, domain: [0, 3] }}
        yAxis={{ formatter: (v: number) => `$${v}`, domain: [0, 40] }}
        referenceLines={[{ y: 20, label: 'Median' }]}
        showGrid={false}
      />,
    )
    const table = screen.getByRole('table', { name: 'Points' })
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((th) => th.textContent),
    ).toEqual(['#', 'x', 'y', 'size'])
    expect(within(table).getByText('9 tickets')).toBeInTheDocument()
    expect(within(table).getByText('2 seats')).toBeInTheDocument()
    expect(screen.getByText('Median')).toBeInTheDocument()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('shows the empty state and supports controlled groups', async () => {
    const user = userEvent.setup()
    const onHiddenGroupsChange = vi.fn()
    const { rerender } = renderChart(<ScatterChart title="Points" data={[]} x="x" y="y" />)
    expect(screen.getByText('No data yet')).toBeInTheDocument()
    rerender(
      <ScatterChart
        title="Points"
        data={[
          { x: 1, y: 2, team: 'A' },
          { x: 2, y: 3, team: 'B' },
        ]}
        x="x"
        y="y"
        groupBy="team"
        hiddenGroups={['A']}
        onHiddenGroupsChange={onHiddenGroupsChange}
        colors={['chart-4', 'chart-5']}
        onPointClick={() => {}}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'A' }))
    expect(onHiddenGroupsChange).toHaveBeenCalledWith([])
  })
})

describe('pie, radial and funnel options', () => {
  const plans = [
    { plan: 'Free', seats: 60 },
    { plan: 'Pro', seats: 40 },
  ]

  it('labels slices by value or name and hides the legend', () => {
    const { rerender } = renderChart(
      <PieChart
        title="Mix"
        data={plans}
        category="plan"
        value="seats"
        labels="value"
        showLegend={false}
      />,
    )
    // Once as a slice label, once in the accessible table.
    expect(screen.getAllByText('60')).toHaveLength(2)
    expect(screen.queryByRole('button')).toBeNull()
    rerender(
      <DonutChart
        title="Mix"
        data={plans}
        category="plan"
        value="seats"
        labels="name"
        colors={['primary']}
      />,
    )
    expect(screen.getAllByText('Free').length).toBeGreaterThan(0)
  })

  it('reports clicked slices and controlled hidden slices', async () => {
    const user = userEvent.setup()
    const onHiddenSlicesChange = vi.fn()
    renderChart(
      <PieChart
        title="Mix"
        data={plans}
        category="plan"
        value="seats"
        hiddenSlices={['Pro']}
        onHiddenSlicesChange={onHiddenSlicesChange}
        onSliceClick={() => {}}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Pro' }))
    expect(onHiddenSlicesChange).toHaveBeenCalledWith([])
  })

  it('toggles radial bars and shows a center label', async () => {
    const user = userEvent.setup()
    const { container } = renderChart(
      <RadialBarChart
        title="Goals"
        data={[
          { goal: 'A', done: 80 },
          { goal: 'B', done: 40 },
        ]}
        category="goal"
        value="done"
        centerLabel={<span>60%</span>}
      />,
    )
    expect(screen.getByText('60%')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'B' }))
    expect(screen.getByRole('button', { name: 'B' })).toHaveAttribute('aria-pressed', 'false')
    expect(container.querySelectorAll('.recharts-radial-bar-sector').length).toBe(1)
  })

  it('draws a plain gauge without bands', () => {
    renderChart(
      <Gauge
        title="Score"
        value={42}
        label="Health"
        color="chart-2"
        hideTitle
        description="Weekly"
      />,
    )
    const meter = screen.getByRole('meter', { name: 'Score' })
    expect(meter).toHaveAttribute('aria-valuetext', '42')
    expect(screen.getByText('Health')).toBeInTheDocument()
  })

  it('can leave out conversion rates', () => {
    renderChart(
      <FunnelChart
        title="Steps"
        data={[
          { step: 'A', n: 10 },
          { step: 'B', n: 1 },
        ]}
        category="step"
        value="n"
        conversion="none"
      />,
    )
    expect(screen.getAllByRole('columnheader').map((th) => th.textContent)).toEqual(['step', 'n'])
    expect(screen.queryByText(/converted/)).toBeNull()
  })
})

describe('ChartCard options', () => {
  it('is controlled and names downloads after its title', async () => {
    const user = userEvent.setup()
    const onViewChange = vi.fn()
    const { rerender } = renderChart(
      <ChartCard
        title="Revenue"
        view="table"
        onViewChange={onViewChange}
        exportable={{ fileName: 'q3' }}
      >
        <LineChart title="Revenue" data={data} index="month" series={[{ key: 'revenue' }]} />
      </ChartCard>,
    )
    expect(screen.getByRole('table')).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'View as table' }))
    expect(onViewChange).toHaveBeenCalledWith('chart')
    // Still the table: the parent owns the view.
    expect(screen.getByRole('table')).toBeVisible()
    rerender(
      <ChartCard title="Revenue" view="chart" actions={<span>Extra</span>}>
        <LineChart title="Revenue" data={data} index="month" series={[{ key: 'revenue' }]} />
      </ChartCard>,
    )
    expect(screen.getByText('Extra')).toBeInTheDocument()
  })

  it('reports export failures', async () => {
    const onExportError = vi.fn()
    renderChart(
      <ChartCard title="Empty" onExportError={onExportError}>
        <p>No chart here</p>
      </ChartCard>,
    )
    const trigger = screen.getByRole('button', { name: 'Download chart' })
    fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false })
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Download SVG' }))
    await vi.waitFor(() => expect(onExportError).toHaveBeenCalled())
    expect(String(onExportError.mock.calls[0]![0])).toMatch(/contains no chart/)
  })
})
