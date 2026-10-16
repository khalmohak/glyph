import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Chart',
  slug: 'chart',
  category: 'Data display',
  status: 'beta',
  description:
    'Line, area, bar and donut charts plus sparklines, colored entirely by the active theme.',
  entry: '@glyphui/ui/chart',
  exports: ['LineChart', 'AreaChart', 'BarChart', 'DonutChart', 'Sparkline', 'chartStyles'],
  source: 'patterns/chart/chart.tsx',
  propsOf: 'LineChart',
  examples: [
    { file: 'line', title: 'Line', description: 'Two series with a value formatter.' },
    { file: 'area', title: 'Stacked area' },
    { file: 'bar', title: 'Bar' },
    { file: 'donut', title: 'Donut and sparkline' },
  ],
  notes: [
    'Install the optional peer dependency first: npm install recharts.',
    'Series colors default to the theme palette (primary, info, success, warning, danger); pass a color name or any CSS color to override.',
    'Every chart is a labelled figure with a visually hidden data table, so screen-reader users get the numbers.',
  ],
})
