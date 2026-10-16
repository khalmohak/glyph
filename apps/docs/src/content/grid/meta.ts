import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Grid',
  slug: 'grid',
  category: 'Layout',
  status: 'beta',
  description:
    'Responsive equal-width columns, set per breakpoint, with gaps from the spacing scale.',
  entry: '@glyphui/ui',
  exports: ['Grid', 'gridStyles'],
  source: 'components/grid/grid.tsx',
  propsOf: 'GridProps',
  examples: [
    {
      file: 'responsive',
      title: 'Responsive columns',
      description: 'Resize the window to see columns change.',
    },
  ],
})
