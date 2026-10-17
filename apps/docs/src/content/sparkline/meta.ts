import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Sparkline',
  slug: 'sparkline',
  category: 'Data display',
  status: 'beta',
  description:
    'A tiny trend without axes, for stat cards and table cells: area, line or bars, with optional high and low marks.',
  entry: '@glyphui/ui/chart',
  exports: ['Sparkline'],
  source: 'patterns/chart/sparkline.tsx',
  propsOf: 'Sparkline',
  examples: [
    { file: 'variants', title: 'Variants', description: 'Area, line with extremes, and bars.' },
  ],
  notes: [
    'title is the accessible description, so say what the trend shows: “Signups over 12 weeks, rising”.',
    'Pass a Sparkline to StatCard’s chart prop for a metric tile.',
  ],
})
