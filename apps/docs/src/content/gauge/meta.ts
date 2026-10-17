import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Gauge',
  slug: 'gauge',
  category: 'Data display',
  status: 'beta',
  description:
    'A single value against a range, with optional colored bands such as healthy, slow and failing.',
  entry: '@glyphui/ui/chart',
  exports: ['Gauge'],
  source: 'patterns/chart/radial.tsx',
  propsOf: 'Gauge',
  examples: [
    { file: 'latency', title: 'With bands', description: 'The arc takes the color of its band.' },
    { file: 'quota', title: 'Quota used' },
  ],
  notes: [
    'Renders as role="meter" with the value, range and band name, e.g. “240 ms, Slow”.',
    'The arc sweeps in on mount and when the value changes, at the theme’s motion level.',
  ],
})
