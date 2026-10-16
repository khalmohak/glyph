import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'AspectRatio',
  slug: 'aspect-ratio',
  category: 'Layout',
  status: 'beta',
  description:
    'Keeps images, video and embeds at a fixed width-to-height ratio so layouts do not shift while loading.',
  entry: '@glyphui/ui',
  exports: ['AspectRatio', 'aspectRatioStyles'],
  source: 'components/aspect-ratio/aspect-ratio.tsx',
  propsOf: 'AspectRatioProps',
  radix: 'https://www.radix-ui.com/primitives/docs/components/aspect-ratio',
  examples: [
    {
      file: 'ratios',
      title: 'Ratios',
      description: 'placeholder fills the box while media loads.',
    },
  ],
})
