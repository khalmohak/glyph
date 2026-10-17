import type { StylesEntry } from '../../utils/registry'
import { focusRing, transition } from '../../utils/styles'
import { tv, type VariantProps } from '../../utils/tv'

export const paginationStyles = /* @__PURE__ */ tv({
  slots: {
    root: 'flex',
    list: 'isolate flex flex-wrap items-center gap-1',
    item: [
      'relative inline-flex shrink-0 cursor-pointer select-none items-center justify-center rounded-md font-medium tabular-nums text-muted-foreground',
      transition,
      focusRing,
      'hover:bg-muted hover:text-foreground',
      'aria-[current=page]:text-primary-foreground aria-[current=page]:hover:bg-transparent',
      'disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40',
      '[&>svg]:size-4',
    ],
    ellipsis: 'inline-flex items-center justify-center text-faint-foreground',
    /** The current page's highlight. Slides to the new page when it changes. */
    indicator: 'pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-primary shadow-xs',
  },
  variants: {
    size: {
      sm: {
        item: 'h-(--glyph-control-sm) min-w-(--glyph-control-sm) px-1.5 text-small',
        ellipsis: 'h-(--glyph-control-sm) w-(--glyph-control-sm) text-small',
      },
      md: {
        item: 'h-(--glyph-control-md) min-w-(--glyph-control-md) px-2 text-small',
        ellipsis: 'h-(--glyph-control-md) w-(--glyph-control-md) text-small',
      },
    },
  },
  defaultVariants: { size: 'md' },
})

export type PaginationVariants = VariantProps<typeof paginationStyles>

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    Pagination: StylesEntry<typeof paginationStyles>
  }
}
