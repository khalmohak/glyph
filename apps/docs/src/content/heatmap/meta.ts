import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Heatmap',
  slug: 'heatmap',
  category: 'Data display',
  status: 'beta',
  description:
    'Activity per day over months, like a contribution calendar. Every day is a keyboard-reachable cell with a tooltip.',
  entry: '@glyphui/ui/chart',
  exports: ['Heatmap'],
  source: 'patterns/chart/heatmap.tsx',
  propsOf: 'Heatmap',
  examples: [
    { file: 'deploys', title: 'Deploys per day', description: 'A year of activity.' },
    {
      file: 'quarter',
      title: 'One quarter, Monday first',
      description: 'from, to and weekStart set the range; onCellClick opens a day.',
    },
  ],
  notes: [
    'Tab moves into the grid once; the arrow keys move by day and week, Home and End jump to the first and last day.',
    'Each cell is read as “12 deploys on Mon, Oct 6, 2026”. Set unit to name what is counted.',
    'Busier days get stronger tints of one color, from the muted surface up to the full color.',
  ],
})
