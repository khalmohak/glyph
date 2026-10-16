import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'StatCard',
  slug: 'stat-card',
  category: 'Data display',
  status: 'beta',
  description:
    'A key metric with its change versus the previous period, an optional icon and a small chart.',
  entry: '@glyphui/ui',
  exports: ['StatCard', 'statCardStyles'],
  source: 'components/stat-card/stat-card.tsx',
  propsOf: 'StatCardProps',
  examples: [
    { file: 'row', title: 'Dashboard row' },
    {
      file: 'chart',
      title: 'With a chart',
      description: 'Pass any chart or sparkline to `chart`; it is colored with the primary color.',
    },
  ],
  notes: [
    'trend sets the arrow and color. Use invertTrend for metrics where down is good, such as churn or latency.',
  ],
})
