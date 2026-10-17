import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Dropdown Menu',
  slug: 'dropdown-menu',
  category: 'Overlays',
  status: 'beta',
  description:
    'A menu of actions opened from a button: row actions, account menus and "more" buttons.',
  entry: '@glyphui/ui',
  exports: [
    'DropdownMenu',
    'DropdownMenuTrigger',
    'DropdownMenuContent',
    'DropdownMenuItem',
    'DropdownMenuCheckboxItem',
    'DropdownMenuRadioGroup',
    'DropdownMenuRadioItem',
    'DropdownMenuLabel',
    'DropdownMenuSeparator',
    'DropdownMenuShortcut',
    'DropdownMenuGroup',
    'DropdownMenuSub',
    'DropdownMenuSubTrigger',
    'DropdownMenuSubContent',
    'dropdownMenuStyles',
  ],
  source: 'components/dropdown-menu/dropdown-menu.tsx',
  propsOf: 'DropdownMenuItemProps',
  radix: 'https://www.radix-ui.com/primitives/docs/components/dropdown-menu',
  examples: [
    {
      file: 'actions',
      title: 'Actions',
      description: 'Icons, keyboard hints and a destructive item.',
    },
    { file: 'options', title: 'Checkbox and radio items' },
    { file: 'submenu', title: 'Submenu' },
  ],
  notes: [
    'Full keyboard support: arrow keys move, typing jumps to an item, Escape closes.',
    'shortcut only displays the hint; bind the key yourself.',
  ],
  a11y: {
    keyboard: [
      {
        keys: 'Space or Enter or Arrow Down',
        action: 'On the trigger: opens the menu and focuses the first item.',
      },
      { keys: 'Arrow Down or Arrow Up', action: 'Moves between items.' },
      { keys: 'Enter or Space', action: 'Activates the focused item.' },
      { keys: 'Arrow Right', action: 'On a submenu trigger: opens the submenu.' },
      { keys: 'Arrow Left', action: 'In a submenu: closes it and returns to its trigger.' },
      { keys: 'Esc', action: 'Closes the menu and returns focus to the trigger.' },
      {
        keys: 'Letter keys',
        action: 'Typeahead: moves to the next item starting with that letter.',
      },
    ],
    notes: [
      'Uses role="menu" with menuitem, menuitemcheckbox and menuitemradio items.',
      'Non-modal by default since 0.8, so the rest of the page stays available to assistive tech; pass modal to trap focus.',
    ],
  },
})
