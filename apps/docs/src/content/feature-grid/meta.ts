import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'FeatureGrid',
  slug: 'feature-grid',
  category: 'Blocks',
  status: 'beta',
  description:
    'A grid of features or benefits, each with an icon, a title and a short description.',
  entry: '@glyphui/blocks',
  exports: ['FeatureGrid', 'featureGridStyles'],
  propsOf: 'FeatureGrid',
  examples: [
    {
      file: 'cards',
      title: 'Cards',
      description: 'Give a feature an href and its whole card becomes a link.',
    },
    { file: 'plain', title: 'Plain, four columns' },
  ],
})
