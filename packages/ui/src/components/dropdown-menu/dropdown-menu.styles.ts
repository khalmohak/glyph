import type { StylesEntry } from '../../utils/registry'
import { popover } from '../../utils/styles'
import { tv, type VariantProps } from '../../utils/tv'

const item = [
  'relative flex h-8 cursor-pointer select-none items-center gap-2 rounded-sm px-2 text-small text-foreground outline-none',
  'data-highlighted:bg-muted data-disabled:pointer-events-none data-disabled:opacity-50',
  '[&_svg]:size-4 [&_svg]:shrink-0',
]

export const dropdownMenuStyles = tv({
  slots: {
    content: [
      popover,
      'min-w-48 max-h-(--radix-dropdown-menu-content-available-height) overflow-y-auto p-1',
    ],
    item,
    icon: 'flex size-4 shrink-0 items-center justify-center text-muted-foreground',
    indicator: 'absolute left-2 flex size-4 items-center justify-center text-primary',
    label: 'px-2 pt-1.5 pb-1 text-caption font-medium text-faint-foreground',
    separator: '-mx-1 my-1 h-px bg-border',
    shortcut: 'ml-auto pl-4 font-mono text-caption tracking-wider text-faint-foreground',
    subTrigger: [...item, 'data-[state=open]:bg-muted'],
    subContent: [popover, 'min-w-40 p-1'],
  },
  variants: {
    tone: {
      default: {},
      danger: {
        item: 'text-danger-text data-highlighted:bg-danger/10',
        icon: 'text-danger-text',
      },
    },
    inset: { true: { item: 'pl-8', label: 'pl-8' } },
  },
  defaultVariants: { tone: 'default' },
})

export type DropdownMenuVariants = VariantProps<typeof dropdownMenuStyles>

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    DropdownMenu: StylesEntry<typeof dropdownMenuStyles>
  }
}
