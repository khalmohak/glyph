import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'SankeyChart',
  slug: 'sankey-chart',
  category: 'Data display',
  status: 'beta',
  description:
    'Where a quantity flows between stages, e.g. traffic sources to pages to signups. Links are given by node name.',
  entry: '@glyphui/ui/chart',
  exports: ['SankeyChart'],
  source: 'patterns/chart/sankey.tsx',
  propsOf: 'SankeyChart',
  examples: [{ file: 'traffic', title: 'Traffic to signups' }],
  notes: [
    'Nodes are created from the names in links; pass nodes to fix their order or colors.',
    'Each link takes its source’s color. Hover a link or node to see its value.',
  ],
})
