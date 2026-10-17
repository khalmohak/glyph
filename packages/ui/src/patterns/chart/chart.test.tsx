import { renderHook, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { GlyphProvider } from '../../provider/glyph-provider'
import { AreaChart, BarChart, ComposedChart, LineChart } from './cartesian'
import {
  ChartTooltipCard,
  categoryColor,
  resolveColor,
  toggleIn,
  useChartAnimation,
} from './chart-parts'
import { renderChart } from './test-utils'

vi.mock('recharts', (original) => import('./test-utils').then((m) => m.mockRecharts(original)))

const data = [
  { month: 'Jan', revenue: 1200, costs: 800 },
  { month: 'Feb', revenue: 1800, costs: 900 },
  { month: 'Mar', revenue: 2100, costs: 950 },
]
const series = [
  { key: 'revenue', label: 'Revenue' },
  { key: 'costs', label: 'Costs', color: 'chart-3' },
] as const

const curves = (container: HTMLElement) => container.querySelectorAll('.recharts-line-curve').length

describe('cartesian charts', () => {
  it('renders a captioned figure with an accessible data table', () => {
    renderChart(
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

  it('hides a series from the legend and never hides the last one', async () => {
    const user = userEvent.setup()
    const { container } = renderChart(
      <LineChart title="Trend" data={data} index="month" series={series} />,
    )
    expect(curves(container)).toBe(2)
    const costs = screen.getByRole('button', { name: 'Costs' })
    expect(costs).toHaveAttribute('aria-pressed', 'true')
    await user.click(costs)
    expect(costs).toHaveAttribute('aria-pressed', 'false')
    expect(curves(container)).toBe(1)
    // Revenue is now the only visible series: clicking it does nothing.
    await user.click(screen.getByRole('button', { name: 'Revenue' }))
    expect(screen.getByRole('button', { name: 'Revenue' })).toHaveAttribute('aria-pressed', 'true')
    await user.click(costs)
    expect(curves(container)).toBe(2)
  })

  it('supports controlled hidden series', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    renderChart(
      <AreaChart
        title="Traffic"
        data={data}
        index="month"
        series={series}
        hiddenSeries={['costs']}
        onHiddenSeriesChange={onChange}
      />,
    )
    expect(screen.getByRole('button', { name: 'Costs' })).toHaveAttribute('aria-pressed', 'false')
    await user.click(screen.getByRole('button', { name: 'Costs' }))
    expect(onChange).toHaveBeenCalledWith([])
  })

  it('shows no legend for a single series', () => {
    const { container } = renderChart(
      <BarChart title="Revenue" data={data} index="month" series={[{ key: 'revenue' }]} />,
    )
    expect(container.querySelector('[data-slot=chart-legend]')).toBeNull()
    expect(container.querySelectorAll('.recharts-bar-rectangle').length).toBe(3)
  })

  it('draws reference lines, areas and a brush', () => {
    const { container } = renderChart(
      <LineChart
        title="Revenue"
        data={data}
        index="month"
        series={[{ key: 'revenue' }]}
        referenceLines={[{ y: 1500, label: 'Target' }]}
        referenceAreas={[{ x1: 'Feb', x2: 'Mar', label: 'Launch' }]}
        brush
      />,
    )
    expect(container.querySelector('.recharts-reference-line')).not.toBeNull()
    expect(container.querySelector('.recharts-reference-area')).not.toBeNull()
    expect(container.querySelector('.recharts-brush')).not.toBeNull()
    expect(screen.getByText('Target')).toBeInTheDocument()
    expect(screen.getByText('Launch')).toBeInTheDocument()
  })

  it('composes bars and lines', () => {
    const { container } = renderChart(
      <ComposedChart
        title="Revenue vs target"
        data={data}
        index="month"
        series={[
          { key: 'revenue', label: 'Revenue', type: 'bar' },
          { key: 'costs', label: 'Costs', type: 'line', axis: 'right' },
        ]}
      />,
    )
    expect(container.querySelectorAll('.recharts-bar-rectangle').length).toBe(3)
    expect(curves(container)).toBe(1)
    expect(container.querySelectorAll('.recharts-yAxis').length).toBe(2)
  })

  it('renders loading, error and empty states in place of the plot', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    const { rerender } = renderChart(
      <LineChart title="Revenue" data={data} index="month" series={series} loading />,
    )
    expect(screen.getByRole('status')).toHaveTextContent('Loading chart')
    expect(screen.getByRole('figure')).toHaveAttribute('aria-busy', 'true')

    rerender(
      <LineChart
        title="Revenue"
        data={data}
        index="month"
        series={series}
        error={new Error('The metrics service timed out.')}
        onRetry={onRetry}
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('The metrics service timed out.')
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(onRetry).toHaveBeenCalled()

    rerender(<LineChart title="Revenue" data={[]} index="month" series={series} />)
    expect(screen.getByText('No data yet')).toBeInTheDocument()
    rerender(
      <LineChart
        title="Revenue"
        data={[]}
        index="month"
        series={series}
        empty={<p>Nothing sold</p>}
      />,
    )
    expect(screen.getByText('Nothing sold')).toBeInTheDocument()
  })
})

describe('ChartTooltipCard', () => {
  const payload = [
    { name: 'Revenue', value: 1200, color: 'red' },
    { name: 'Costs', value: 800, color: 'blue' },
  ]

  it('formats values and labels', () => {
    renderChart(
      <ChartTooltipCard
        active
        payload={payload}
        label="Jan"
        formatter={(v) => `$${v}`}
        labelFormatter={(label) => `Month: ${String(label)}`}
      />,
    )
    expect(screen.getByText('Month: Jan')).toBeInTheDocument()
    expect(screen.getByText('$1200')).toBeInTheDocument()
    expect(screen.queryByText('Total')).toBeNull()
  })

  it('adds a total row for stacked charts', () => {
    renderChart(<ChartTooltipCard active payload={payload} formatter={(v) => `$${v}`} total />)
    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('$2000')).toBeInTheDocument()
  })

  it('renders nothing when inactive', () => {
    const { container } = renderChart(
      <ChartTooltipCard active={false} payload={payload} formatter={String} />,
    )
    expect(container.querySelector('[data-slot=chart-tooltip]')).toBeNull()
  })
})

describe('chart colors', () => {
  it('defaults series to the theme chart palette, in order', () => {
    expect([0, 1, 4, 5].map((i) => resolveColor(undefined, i))).toEqual([
      'var(--glyph-chart-1)',
      'var(--glyph-chart-2)',
      'var(--glyph-chart-5)',
      'var(--glyph-chart-1)',
    ])
  })

  it('accepts theme color names and raw CSS colors', () => {
    expect(resolveColor('success', 0)).toBe('var(--glyph-success)')
    expect(resolveColor('chart-3', 0)).toBe('var(--glyph-chart-3)')
    expect(resolveColor('#ff0066', 0)).toBe('#ff0066')
    expect(resolveColor('oklch(70% 0.1 200)', 0)).toBe('oklch(70% 0.1 200)')
  })

  it('never repeats a category color past the palette', () => {
    expect(categoryColor(undefined, 0)).toBe('var(--glyph-chart-1)')
    expect(categoryColor(undefined, 5)).toContain('color-mix')
    expect(categoryColor(undefined, 5)).not.toBe(categoryColor(undefined, 0))
    expect(categoryColor('danger', 7)).toBe('var(--glyph-danger)')
  })

  it('toggles keys but keeps one visible', () => {
    expect(toggleIn(['a'], 'a', 3)).toEqual([])
    expect(toggleIn([], 'a', 3)).toEqual(['a'])
    expect(toggleIn(['a', 'b'], 'c', 3)).toEqual(['a', 'b'])
  })
})

describe('chart animation', () => {
  const wrap =
    (motion: 'none' | 'subtle' | 'expressive') =>
    ({ children }: { children: ReactNode }) => (
      <GlyphProvider storageKey={null} motion={motion}>
        {children}
      </GlyphProvider>
    )

  it('follows the motion level', () => {
    const off = renderHook(useChartAnimation, { wrapper: wrap('none') }).result.current
    const subtle = renderHook(useChartAnimation, { wrapper: wrap('subtle') }).result.current
    const expressive = renderHook(useChartAnimation, { wrapper: wrap('expressive') }).result.current
    expect(off.isAnimationActive).toBe(false)
    expect(subtle.isAnimationActive).toBe(true)
    expect(expressive.animationDuration).toBeGreaterThan(subtle.animationDuration)
  })
})

describe('hidden plot', () => {
  it('keeps recharts controls out of the tab order', async () => {
    const { container } = renderChart(
      <LineChart title="Revenue" data={data} index="month" series={[{ key: 'revenue' }]} brush />,
    )
    const plot = container.querySelector('[data-slot=chart-plot]')!
    expect(plot).toHaveAttribute('aria-hidden', 'true')
    expect(plot.querySelector('.recharts-brush-traveller')).not.toBeNull()
    // Recharts adds some focusable nodes after mount; the observer catches them.
    await waitFor(() => {
      const focusable = [...plot.querySelectorAll('[tabindex]')]
        .filter((node) => node.getAttribute('tabindex') !== '-1')
        .map((node) => node.getAttribute('class'))
      expect(focusable).toEqual([])
    })
  })
})
