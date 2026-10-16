import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'SectionHeader',
  slug: 'section-header',
  category: 'Blocks',
  status: 'beta',
  description:
    'Eyebrow, title and description at the top of a section. Most blocks use it; use it for your own sections too.',
  entry: '@glyphui/blocks',
  exports: ['SectionHeader'],
  propsOf: 'SectionHeader',
  examples: [{ file: 'basic', title: 'Left and centered' }],
})
