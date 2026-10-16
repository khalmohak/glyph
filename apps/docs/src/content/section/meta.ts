import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Section',
  slug: 'section',
  category: 'Layout',
  status: 'stable',
  description: 'A full-width page band with consistent vertical rhythm. Put a Container inside.',
  entry: '@glyphui/ui',
  exports: ['Section', 'sectionStyles'],
  source: 'components/section/section.tsx',
  propsOf: 'Section',
  examples: [{ file: 'bands', title: 'Page bands' }],
})
