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
  a11y: {
    keyboard: [
      {
        keys: '\u2318 + K or Ctrl + K',
        action: 'Opens or closes the menu (with useCommandMenuShortcut).',
      },
      { keys: 'Typing', action: 'Filters commands.' },
      { keys: 'Arrow Down or Arrow Up', action: 'Moves the highlighted command.' },
      { keys: 'Enter', action: 'Runs the highlighted command.' },
      { keys: 'Esc', action: 'Closes the menu.' },
    ],
    notes: [
      'It is a dialog containing a combobox and listbox; the highlighted item is announced as you move.',
    ],
  },
})
