import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'FeatureSplit',
  slug: 'feature-split',
  category: 'Blocks',
  status: 'beta',
  description:
    'Feature rows that alternate text and media, for explaining a product in more depth than a grid allows.',
  entry: '@glyphui/blocks',
  exports: ['FeatureSplit'],
  propsOf: 'FeatureSplit',
  examples: [{ file: 'basic', title: 'Alternating rows' }],
})
