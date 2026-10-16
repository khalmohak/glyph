import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'CommandMenu',
  slug: 'command-menu',
  category: 'Navigation',
  status: 'beta',
  description:
    'A ⌘K command palette: search, grouped actions and keyboard navigation in a modal dialog.',
  entry: '@glyphui/ui',
  exports: [
    'CommandMenu',
    'Command',
    'CommandInput',
    'CommandList',
    'CommandEmpty',
    'CommandGroup',
    'CommandItem',
    'CommandSeparator',
    'useCommandMenuShortcut',
    'commandMenuStyles',
  ],
  source: 'components/command-menu/command-menu.tsx',
  propsOf: 'CommandMenuProps',
  examples: [
    {
      file: 'basic',
      title: 'Command palette',
      description: 'Press ⌘K (or Ctrl+K) anywhere on the page.',
    },
    {
      file: 'inline',
      title: 'Inline',
      description: 'Command without the dialog, for search panels.',
    },
  ],
  notes: [
    'Items close the menu after onSelect by default; pass closeOnSelect={false} to keep it open.',
    'Shortcuts on items are display-only hints; bind the keys yourself if they should work globally.',
  ],
})
