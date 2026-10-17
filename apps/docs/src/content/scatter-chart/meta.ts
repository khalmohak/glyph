import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'ScatterChart',
  slug: 'scatter-chart',
  category: 'Data display',
  status: 'beta',
  description:
    'How two measures relate, one dot per item. Add size for a bubble chart and groupBy for colored groups.',
  entry: '@glyphui/ui/chart',
  exports: ['ScatterChart'],
  source: 'patterns/chart/scatter.tsx',
  propsOf: 'ScatterChart',
  examples: [
    {
      file: 'bubble',
      title: 'Bubble chart',
      description: 'Accounts by seats and MRR, sized by open tickets and grouped by segment.',
    },
  ],
  notes: [
    'Always name both axes with xAxis.label and yAxis.label: a scatter has no other labels.',
    'Click a legend entry to hide a group. Set name to show each point’s name in the tooltip.',
  ],
})
