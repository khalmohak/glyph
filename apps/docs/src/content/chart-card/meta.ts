import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'ChartCard',
  slug: 'chart-card',
  category: 'Data display',
  status: 'beta',
  description:
    'A card for one chart with a period selector, a “view as table” toggle and PNG or SVG download. exportChart downloads any chart.',
  entry: '@glyphui/ui/chart',
  exports: ['ChartCard', 'chartCardStyles', 'exportChart', 'serializeChart'],
  source: 'patterns/chart/chart-card.tsx',
  propsOf: 'ChartCard',
  examples: [
    {
      file: 'dashboard',
      title: 'Dashboard card',
      description: 'Switch the period, view the numbers as a table, or download the chart.',
    },
    {
      file: 'export',
      title: 'Export without a card',
      description: 'exportChart(element, { format }) bakes the theme’s colors into the file.',
    },
  ],
  notes: [
    'The chart inside hides its caption (the card shows the title) but keeps it as its accessible name.',
    'The table view is a real, visible table of the same rows the chart plots, for anyone who wants exact numbers.',
    'Exports resolve every theme variable, so the PNG or SVG looks the same outside your app. Web fonts fall back to system fonts in PNGs.',
  ],
})
