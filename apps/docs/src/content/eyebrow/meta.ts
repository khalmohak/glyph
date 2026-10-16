import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Eyebrow',
  slug: 'eyebrow',
  category: 'Typography',
  status: 'stable',
  description: 'A small uppercase label that sits above a heading.',
  entry: '@glyphui/ui',
  exports: ['Eyebrow', 'eyebrowStyles'],
  source: 'components/eyebrow/eyebrow.tsx',
  propsOf: 'Eyebrow',
  examples: [{ file: 'with-heading', title: 'Above a heading' }],
})
