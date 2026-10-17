import { Gauge } from '@glyphui/ui/chart'

export default function Example() {
  return (
    <Gauge
      title="API latency"
      description="p95, last 15 minutes"
      value={238}
      max={600}
      valueFormatter={(v) => `${v} ms`}
      bands={[
        { to: 200, color: 'success', label: 'Healthy' },
        { to: 400, color: 'warning', label: 'Slow' },
        { to: 600, color: 'danger', label: 'Failing' },
      ]}
    />
  )
}
