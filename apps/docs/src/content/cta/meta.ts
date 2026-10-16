import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Cta',
  slug: 'cta',
  category: 'Blocks',
  status: 'beta',
  description:
    'The closing call to action near the end of a page, as a raised card or an open band.',
  entry: '@glyphui/blocks',
  exports: ['Cta', 'ctaStyles'],
  propsOf: 'Cta',
  examples: [
    { file: 'card', title: 'Card' },
    { file: 'band', title: 'Band' },
  ],
})
