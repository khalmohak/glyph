import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Text',
  slug: 'text',
  category: 'Typography',
  status: 'stable',
  description: 'Body copy in the theme type scale, with tones, weights, mono and truncation.',
  entry: '@glyphui/ui',
  exports: ['Text', 'textStyles'],
  source: 'components/text/text.tsx',
  propsOf: 'Text',
  examples: [
    { file: 'sizes', title: 'Sizes' },
    { file: 'tones', title: 'Tones' },
    {
      file: 'as-child',
      title: 'Other elements',
      description: 'Renders a <p> by default; asChild styles a span, label or anything else.',
    },
  ],
})
