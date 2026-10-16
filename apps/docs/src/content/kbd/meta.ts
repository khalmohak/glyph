import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Kbd',
  slug: 'kbd',
  category: 'Data display',
  status: 'stable',
  description: 'A keyboard key or shortcut hint.',
  entry: '@glyphui/ui',
  exports: ['Kbd', 'kbdStyles'],
  source: 'components/kbd/kbd.tsx',
  propsOf: 'Kbd',
  examples: [
    { file: 'shortcuts', title: 'Shortcuts' },
    { file: 'in-input', title: 'Inside an input' },
  ],
})
