import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Container',
  slug: 'container',
  category: 'Layout',
  status: 'stable',
  description: 'Centers content at a readable maximum width with consistent side gutters.',
  entry: '@glyphui/ui',
  exports: ['Container', 'containerStyles'],
  source: 'components/container/container.tsx',
  propsOf: 'Container',
  examples: [{ file: 'sizes', title: 'Sizes' }],
})
