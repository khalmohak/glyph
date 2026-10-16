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
})
