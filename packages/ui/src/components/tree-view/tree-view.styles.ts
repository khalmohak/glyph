import type { StylesEntry } from '../../utils/registry'
import { transition } from '../../utils/styles'
import { tv, type VariantProps } from '../../utils/tv'

export const treeViewStyles = /* @__PURE__ */ tv({
  slots: {
    root: 'grid gap-px text-small',
    // Focus and selection are drawn on the item's own row only, never on nested rows.
    item: [
      'outline-none',
      'focus-visible:[&>[data-slot=tree-row]]:ring-2 focus-visible:[&>[data-slot=tree-row]]:ring-ring',
      'aria-selected:[&>[data-slot=tree-row]]:bg-muted aria-selected:[&>[data-slot=tree-row]]:text-foreground aria-selected:[&>[data-slot=tree-row]]:font-medium',
      'aria-disabled:[&>[data-slot=tree-row]]:pointer-events-none aria-disabled:[&>[data-slot=tree-row]]:opacity-50',
    ],
    row: [
      'group/row flex h-8 cursor-pointer select-none items-center gap-1.5 rounded-sm pr-2 text-muted-foreground',
      transition,
      'hover:bg-muted hover:text-foreground',
    ],
    chevron:
      'size-4 shrink-0 text-faint-foreground transition-transform duration-(--glyph-duration-fast) ease-standard group-data-[state=open]/row:rotate-90',
    spacer: 'size-4 shrink-0',
    icon: 'flex size-4 shrink-0 items-center justify-center text-faint-foreground [&>svg]:size-4',
    label: 'min-w-0 flex-1 truncate',
    group: 'grid gap-px',
  },
  variants: {
    size: {
      sm: { row: 'h-7 text-caption' },
      md: {},
    },
  },
  defaultVariants: { size: 'md' },
})

export type TreeViewVariants = VariantProps<typeof treeViewStyles>

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    TreeView: StylesEntry<typeof treeViewStyles>
  }
}
