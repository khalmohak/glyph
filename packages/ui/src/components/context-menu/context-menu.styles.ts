import type { StylesEntry } from '../../utils/registry'
import { tv, type VariantProps } from '../../utils/tv'
import { dropdownMenuStyles } from '../dropdown-menu/dropdown-menu.styles'

/** Same look as DropdownMenu; only the available-height variable differs. */
export const contextMenuStyles = tv({
  extend: dropdownMenuStyles,
  slots: {
    content: 'max-h-(--radix-context-menu-content-available-height)',
  },
})

export type ContextMenuVariants = VariantProps<typeof contextMenuStyles>

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    ContextMenu: StylesEntry<typeof contextMenuStyles>
  }
}
