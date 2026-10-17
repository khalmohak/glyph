import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'ContextMenu',
  slug: 'context-menu',
  category: 'Overlays',
  status: 'beta',
  description:
    'A menu opened by right-click or long-press on an area, with the same items as DropdownMenu.',
  entry: '@glyphui/ui',
  exports: [
    'ContextMenu',
    'ContextMenuTrigger',
    'ContextMenuContent',
    'ContextMenuItem',
    'ContextMenuCheckboxItem',
    'ContextMenuRadioGroup',
    'ContextMenuRadioItem',
    'ContextMenuLabel',
    'ContextMenuSeparator',
    'ContextMenuShortcut',
    'ContextMenuGroup',
    'ContextMenuSub',
    'ContextMenuSubTrigger',
    'ContextMenuSubContent',
    'contextMenuStyles',
  ],
  source: 'components/context-menu/context-menu.tsx',
  propsOf: 'ContextMenuItem',
  radix: 'https://www.radix-ui.com/primitives/docs/components/context-menu',
  examples: [
    {
      file: 'file',
      title: 'File actions',
      description: 'Right-click (or long-press on touch) the card.',
    },
    { file: 'checkable', title: 'Checkbox and radio items' },
  ],
  notes: [
    'Context menus are hard to discover. Offer the same actions in a visible place too, such as a DropdownMenu on a "more" button.',
    'Items take icon, shortcut, tone="danger" and inset, exactly like DropdownMenuItem.',
  ],
  a11y: {
    keyboard: [
      {
        keys: 'Shift + F10 or Menu key',
        action:
          'Opens the menu for the focused element, in browsers that fire a contextmenu event for it.',
      },
      { keys: 'Arrow Down or Arrow Up', action: 'Moves between items.' },
      { keys: 'Enter or Space', action: 'Activates the focused item.' },
      { keys: 'Esc', action: 'Closes the menu.' },
    ],
    notes: [
      "Right-click is not discoverable: offer the same actions somewhere visible, such as a row's \u22ef menu.",
    ],
  },
})
