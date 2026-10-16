import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Blockquote',
  slug: 'blockquote',
  category: 'Typography',
  status: 'beta',
  description: 'A quotation set in the display font, with an accent rule and optional attribution.',
  entry: '@glyphui/ui',
  exports: ['Blockquote', 'blockquoteStyles'],
  source: 'components/blockquote/blockquote.tsx',
  propsOf: 'BlockquoteProps',
  examples: [
    { file: 'attribution', title: 'With attribution' },
    { file: 'sizes', title: 'Sizes' },
  ],
})
