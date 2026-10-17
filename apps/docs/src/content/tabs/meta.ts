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
  a11y: {
    keyboard: [
      {
        keys: 'Arrow Left or Arrow Right',
        action: "Moves between tabs and shows the focused tab's panel.",
      },
      { keys: 'Home or End', action: 'Moves to the first or last tab.' },
      { keys: 'Tab', action: 'Moves from the tab list into the active panel.' },
    ],
    notes: [
      'Uses role="tablist", tab and tabpanel, with aria-selected and aria-controls.',
      'Panels show a focus ring when focused, so the Tab stop into a panel is visible.',
    ],
  },
})
