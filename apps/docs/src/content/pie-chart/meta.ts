import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'PieChart',
  slug: 'pie-chart',
  category: 'Data display',
  status: 'beta',
  description:
    'Parts of a whole as a pie or donut, with slice labels, a highlighted slice on hover and a legend that hides slices.',
  entry: '@glyphui/ui/chart',
  exports: ['PieChart', 'DonutChart'],
  source: 'patterns/chart/pie.tsx',
  propsOf: 'PieChart',
  examples: [
    { file: 'donut', title: 'Donut', description: 'A headline number in the middle.' },
    { file: 'pie', title: 'Pie with labels', description: 'labels="percent" shows each share.' },
  ],
  notes: [
    'Use five slices or fewer; fold the rest into “Other”. People compare angles poorly, so for exact comparisons use a bar chart.',
    'Hiding a slice in the legend keeps every slice’s color, so colors keep meaning the same thing.',
    'DonutChart is PieChart with innerRadius 0.68. The center label only shows on a donut.',
  ],
})
