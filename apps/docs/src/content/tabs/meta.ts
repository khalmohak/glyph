import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Tabs',
  slug: 'tabs',
  category: 'Navigation',
  status: 'stable',
  description: 'Switches between related panels of content. Underline and pill variants.',
  entry: '@glyphui/ui',
  exports: ['Tabs', 'TabsList', 'TabsTrigger', 'TabsContent', 'tabsStyles'],
  source: 'components/tabs/tabs.tsx',
  propsOf: 'Tabs',
  radix: 'https://www.radix-ui.com/primitives/docs/components/tabs',
  examples: [
    { file: 'underline', title: 'Underline' },
    { file: 'pill', title: 'Pill' },
  ],
  notes: ['Arrow keys move between tabs; the panel is linked to its tab for screen readers.'],
})
