import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Heading',
  slug: 'heading',
  category: 'Typography',
  status: 'stable',
  description:
    'A heading whose document level and visual size are set independently, using the theme type scale.',
  entry: '@glyphui/ui',
  exports: ['Heading', 'headingStyles'],
  source: 'components/heading/heading.tsx',
  propsOf: 'Heading',
  examples: [
    { file: 'scale', title: 'Type scale' },
    {
      file: 'level-vs-size',
      title: 'Level and size',
      description: 'Keep the outline correct while choosing any visual size.',
    },
  ],
  notes: [
    'level sets the h1–h6 element; size sets the look. Choose level for the document outline.',
    'Headings use font-display and text-wrap: balance.',
  ],
})
