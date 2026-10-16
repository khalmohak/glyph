import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Stack',
  slug: 'stack',
  category: 'Layout',
  status: 'stable',
  description:
    'Flex layout with gaps from the spacing scale. Column by default; direction="row" for horizontal.',
  entry: '@glyphui/ui',
  exports: ['Stack', 'stackStyles'],
  source: 'components/stack/stack.tsx',
  propsOf: 'Stack',
  examples: [
    { file: 'column', title: 'Column' },
    { file: 'row', title: 'Row' },
  ],
})
