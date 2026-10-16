import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Separator',
  slug: 'separator',
  category: 'Layout',
  status: 'stable',
  description: 'A thin divider between groups of content, horizontal or vertical.',
  entry: '@glyphui/ui',
  exports: ['Separator', 'separatorStyles'],
  source: 'components/separator/separator.tsx',
  propsOf: 'Separator',
  radix: 'https://www.radix-ui.com/primitives/docs/components/separator',
  examples: [{ file: 'both', title: 'Horizontal and vertical' }],
  notes: [
    'Decorative by default. Set decorative={false} when the divider separates meaningful sections.',
  ],
})
