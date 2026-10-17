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
  a11y: {
    keyboard: [
      { keys: 'Arrow Up or Arrow Down', action: 'Previous or next day.' },
      { keys: 'Arrow Left or Arrow Right', action: 'Previous or next week.' },
      { keys: 'Page Up or Page Down', action: 'Four weeks back or forward.' },
      { keys: 'Home or End', action: 'First or last day.' },
      { keys: 'Enter or Space', action: 'Activates the day, when onCellClick is set.' },
    ],
    notes: ["The grid has one Tab stop; each cell's label reads its date and value."],
  },
})
