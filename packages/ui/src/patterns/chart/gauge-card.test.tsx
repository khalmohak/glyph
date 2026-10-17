import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ChartCard } from './chart-card'
import { Gauge } from './radial'
import { renderChart } from './test-utils'

// Relay finding U6: inside a ChartCard, the card already shows the title.
describe('Gauge in a ChartCard', () => {
  it('keeps its title for screen readers but doesn’t show it twice', () => {
    renderChart(
      <ChartCard title="API latency">
        <Gauge title="API latency" value={238} max={600} />
      </ChartCard>,
    )
    const meter = screen.getByRole('meter', { name: 'API latency' })
    const caption = meter.closest('figure')?.querySelector('figcaption')
    expect(caption).toHaveClass('sr-only')
  })

  it('still shows its title on its own', () => {
    renderChart(<Gauge title="API latency" value={238} max={600} />)
    const caption = screen.getByRole('meter').closest('figure')?.querySelector('figcaption')
    expect(caption).not.toHaveClass('sr-only')
  })
})
