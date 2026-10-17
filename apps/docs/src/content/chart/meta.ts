import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Chart',
  slug: 'chart',
  category: 'Data display',
  status: 'beta',
  description:
    'Line, area, bar and composed charts with interactive legends, reference lines, zoom, and loading, error and empty states, all colored by the theme.',
  entry: '@glyphui/ui/chart',
  exports: [
    'LineChart',
    'AreaChart',
    'BarChart',
    'ComposedChart',
    'ChartLegend',
    'ChartTooltipCard',
    'chartStyles',
  ],
  source: 'patterns/chart/cartesian.tsx',
  propsOf: 'LineChart',
  examples: [
    { file: 'line', title: 'Line', description: 'Two series with a value formatter.' },
    {
      file: 'area',
      title: 'Stacked area',
      description: 'Stacked charts add a total row to the tooltip.',
    },
    { file: 'bar', title: 'Bar' },
    {
      file: 'horizontal',
      title: 'Horizontal bars',
      description: 'layout="vertical" for long category names.',
    },
    {
      file: 'composed',
      title: 'Composed',
      description: 'Bars and a line on one plot. Click a legend entry to hide its series.',
    },
    {
      file: 'reference-lines',
      title: 'Targets and annotations',
      description: 'referenceLines for goals and limits, referenceAreas for periods.',
    },
    {
      file: 'brush',
      title: 'Zoom with a brush',
      description: 'Drag the handles under the plot to focus on a range.',
    },
    {
      file: 'states',
      title: 'Loading, error and empty',
      description: 'The same props as every Glyph data component.',
    },
    {
      file: 'live',
      title: 'Live data',
      description: 'Pass new data and the series animate to it, at the theme’s motion level.',
    },
  ],
  notes: [
    'Install the optional peer dependency first: npm install recharts.',
    'Series colors default to the theme chart palette (chart-1 to chart-5), in order; pass a theme color name or any CSS color to override. Keep the same color for the same thing across charts.',
    'Set the palette in your theme file: colors: { light: { "chart-1": "oklch(55% 0.2 30)" } }. A theme without chart colors falls back to primary, info, success, warning and danger.',
    'With more than one series the legend is interactive: click or press Enter on an entry to hide its series. hiddenSeries and onHiddenSeriesChange control it.',
    'Entry and update animations follow the theme motion level and turn off for visitors who prefer reduced motion.',
    'Every chart is a labelled figure with a visually hidden data table, so screen-reader users get the numbers. Wrap a chart in ChartCard to let everyone switch to the table.',
    'The brush is a pointer control. Keyboard and screen-reader users get every row from the data table; wrap the chart in ChartCard to make that table visible.',
    'ComposedChart can put a series on a right-hand axis (axis: "right"). Two scales on one plot are easy to misread; prefer two charts with the same syncId when you can.',
  ],
})
