import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { LineChart } from './cartesian'
import { ChartCard } from './chart-card'
import { exportChart, resolveCssVariables, serializeChart } from './export'
import { renderChart } from './test-utils'

vi.mock('recharts', (original) => import('./test-utils').then((m) => m.mockRecharts(original)))

const data = [
  { month: 'Jan', revenue: 1200 },
  { month: 'Feb', revenue: 1800 },
]

function chart() {
  return (
    <LineChart
      title="Revenue"
      data={data}
      index="month"
      series={[{ key: 'revenue', label: 'Revenue' }]}
      valueFormatter={(v) => `$${v}`}
    />
  )
}

describe('ChartCard', () => {
  it('shows a title and swaps the chart for a visible table', async () => {
    const user = userEvent.setup()
    const onViewChange = vi.fn()
    const { container } = renderChart(
      <ChartCard title="Revenue" description="Last two months" onViewChange={onViewChange}>
        {chart()}
      </ChartCard>,
    )
    expect(screen.getByText('Last two months')).toBeInTheDocument()
    expect(container.querySelector('.recharts-line-curve')).not.toBeNull()

    const toggle = screen.getByRole('button', { name: 'View as table' })
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-pressed', 'true')
    expect(onViewChange).toHaveBeenCalledWith('table')
    expect(container.querySelector('.recharts-line-curve')).toBeNull()
    const table = screen.getByRole('table')
    expect(within(table).getByText('$1800')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Download chart' })).toBeDisabled()
  })

  it('renders a period selector', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    renderChart(
      <ChartCard
        title="Revenue"
        period={{
          options: [
            { value: '7d', label: '7d' },
            { value: '30d', label: '30d' },
          ],
          defaultValue: '7d',
          onValueChange,
        }}
      >
        {chart()}
      </ChartCard>,
    )
    await user.click(screen.getByRole('radio', { name: '30d' }))
    expect(onValueChange).toHaveBeenCalledWith('30d')
  })

  it('hides the built-in buttons when asked', () => {
    renderChart(
      <ChartCard title="Revenue" tableToggle={false} exportable={false}>
        {chart()}
      </ChartCard>,
    )
    expect(screen.queryByRole('button', { name: 'View as table' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Download chart' })).toBeNull()
  })
})

// jsdom's Blob has no text(); FileReader works everywhere.
const readText = (blob: Blob) =>
  new Promise<string>((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.readAsText(blob)
  })

describe('exportChart', () => {
  afterEach(() => {
    document.documentElement.style.removeProperty('--glyph-chart-1')
    vi.restoreAllMocks()
  })

  it('resolves nested CSS variables with fallbacks', () => {
    document.documentElement.style.setProperty('--glyph-chart-1', '#0a84ff')
    const el = document.createElement('div')
    document.body.append(el)
    expect(resolveCssVariables('var(--glyph-chart-1)', el)).toBe('#0a84ff')
    expect(resolveCssVariables('var(--missing, red)', el)).toBe('red')
    el.remove()
  })

  it('serializes the chart with theme colors baked in', () => {
    document.documentElement.style.setProperty('--glyph-chart-1', '#0a84ff')
    const { container } = renderChart(chart())
    const { svg } = serializeChart(container, { background: '#ffffff' })
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"')
    expect(svg).toContain('#0a84ff')
    expect(svg).not.toContain('var(--glyph-chart-1)')
    expect(svg).toContain('fill="#ffffff"')
    // The title is drawn into the file, so it stands on its own.
    expect(svg).toContain('>Revenue</text>')
  })

  it('adds the legend and can leave out the title', () => {
    const { container } = renderChart(
      <LineChart
        title="Revenue and costs"
        data={[
          { month: 'Jan', revenue: 1, costs: 2 },
          { month: 'Feb', revenue: 2, costs: 1 },
        ]}
        index="month"
        series={[
          { key: 'revenue', label: 'Revenue' },
          { key: 'costs', label: 'Costs' },
        ]}
      />,
    )
    const { svg } = serializeChart(container, { title: false })
    expect(svg).not.toContain('>Revenue and costs</text>')
    expect(svg).toContain('>Costs</text>')
  })

  it('returns an SVG file and downloads it', async () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    URL.createObjectURL = vi.fn(() => 'blob:chart')
    URL.revokeObjectURL = vi.fn()
    const { container } = renderChart(chart())
    const blob = await exportChart(container, { format: 'svg', fileName: 'revenue' })
    expect(blob.type).toContain('image/svg+xml')
    expect(await readText(blob)).toContain('<svg')
    expect(click).toHaveBeenCalledTimes(1)
  })

  it('draws a PNG at the requested scale', async () => {
    const drawImage = vi.fn()
    const scale = vi.fn()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      scale,
      drawImage,
    } as unknown as CanvasRenderingContext2D)
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => {
      callback(new Blob(['png'], { type: 'image/png' }))
    })
    // jsdom never loads images: resolve as soon as a source is set.
    const original = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src')!
    Object.defineProperty(HTMLImageElement.prototype, 'src', {
      configurable: true,
      set(this: HTMLImageElement, value: string) {
        original.set!.call(this, value)
        queueMicrotask(() => this.onload?.(new Event('load')))
      },
      get: original.get!,
    })
    try {
      const { container } = renderChart(chart())
      const blob = await exportChart(container, { format: 'png', scale: 3, download: false })
      expect(blob.type).toBe('image/png')
      expect(scale).toHaveBeenCalledWith(3, 3)
      expect(drawImage).toHaveBeenCalled()
    } finally {
      Object.defineProperty(HTMLImageElement.prototype, 'src', original)
    }
  })

  it('fails clearly without a chart', () => {
    expect(() => serializeChart(document.createElement('div'))).toThrow(/contains no chart/)
  })
})
