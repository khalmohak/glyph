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
})
