import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Treemap',
  slug: 'treemap',
  category: 'Data display',
  status: 'beta',
  description:
    'Sizes of many parts of a whole as nested rectangles, grouped and colored by category.',
  entry: '@glyphui/ui/chart',
  exports: ['Treemap'],
  source: 'patterns/chart/treemap.tsx',
  propsOf: 'Treemap',
  examples: [{ file: 'spend', title: 'Cloud spend', description: 'Vendors grouped by team.' }],
  notes: [
    'Tiles too small for text show it in the tooltip and the accessible table instead.',
    'Each group gets one palette color; after five groups, colors are blended rather than repeated.',
  ],
})
