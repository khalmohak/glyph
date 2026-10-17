import type { StylesEntry } from '../../utils/registry'
import { focusRing, themedBorder } from '../../utils/styles'
import { tv, type VariantProps } from '../../utils/tv'

export const dataTableStyles = /* @__PURE__ */ tv({
  slots: {
    // `overflow-clip` rounds the card without creating a scroll container, so the bulk bar
    // can stay stuck to the bottom of the viewport while the table scrolls past.
    root: 'relative flex min-w-0 flex-col',
    toolbar: 'flex flex-wrap items-center gap-2',
    search: 'w-full sm:max-w-64',
    filters: 'flex flex-wrap items-center gap-1.5',
    actions: 'ml-auto flex items-center gap-2',
    scroller: 'relative w-full overflow-auto overscroll-x-contain',
    table: 'w-full caption-bottom border-collapse text-small tabular-nums',
    head: 'group/head relative bg-surface',
    headInner: 'flex min-w-0 items-center gap-1',
    sortButton: [
      '-ml-1.5 inline-flex min-w-0 cursor-pointer select-none items-center gap-1 rounded-xs px-1.5 py-1 hover:text-foreground [&>svg]:size-3.5 [&>svg]:shrink-0',
      focusRing,
    ],
    sortIndex: 'font-mono text-[0.625rem] leading-none text-faint-foreground',
    headerMenu: [
      'ml-auto inline-flex size-6 shrink-0 items-center justify-center rounded-xs text-faint-foreground opacity-0 transition-opacity duration-(--glyph-duration-fast) hover:bg-muted hover:text-foreground focus-visible:opacity-100 pointer-coarse:opacity-100 group-hover/head:opacity-100 data-[state=open]:opacity-100 data-[state=open]:bg-muted [&>svg]:size-3.5',
      focusRing,
    ],
    resizer: [
      // Inside the cell: with a sticky header each cell is its own stacking context, so a
      // handle hanging over the edge would be covered by the next header.
      'absolute top-0 right-0 z-10 h-full w-2 cursor-col-resize touch-none select-none outline-none',
      'after:absolute after:inset-y-2 after:right-0 after:w-px after:bg-border after:opacity-0 after:transition-opacity group-hover/head:after:opacity-100',
      'hover:after:w-0.5 hover:after:bg-primary hover:after:opacity-100 focus-visible:after:w-0.5 focus-visible:after:bg-ring focus-visible:after:opacity-100 data-[resizing=true]:after:w-0.5 data-[resizing=true]:after:bg-primary data-[resizing=true]:after:opacity-100',
    ],
    row: 'group/row',
    clickableRow: 'cursor-pointer',
    rowLink: [
      'rounded-xs text-foreground no-underline outline-none focus-visible:underline focus-visible:decoration-ring focus-visible:decoration-2 focus-visible:underline-offset-4',
    ],
    // Sticky cells paint over collapsed row borders, so pinned cells draw their own divider.
    pinned:
      'sticky z-[1] bg-surface [tbody_tr:not(:last-child)>&]:shadow-[inset_0_calc(-1*var(--glyph-border-width))_0_0_var(--color-border)] [thead_&]:shadow-[inset_0_calc(-1*var(--glyph-border-width))_0_0_var(--color-border)]',
    pinnedEdgeLeft:
      'after:pointer-events-none after:absolute after:inset-y-0 after:-right-3 after:w-3 after:bg-linear-to-r after:from-black/10 after:to-transparent dark:after:from-black/45 after:opacity-0 after:transition-opacity data-[scrolled=true]:after:opacity-100',
    pinnedEdgeRight:
      'before:pointer-events-none before:absolute before:inset-y-0 before:-left-3 before:w-3 before:bg-linear-to-l before:from-black/10 before:to-transparent dark:before:from-black/45 before:opacity-0 before:transition-opacity data-[scrolled=true]:before:opacity-100',
    dropIndicator: 'shadow-[inset_2px_0_0_0_var(--color-primary)]',
    expandButton: [
      'inline-flex size-6 items-center justify-center rounded-xs text-muted-foreground hover:bg-muted hover:text-foreground [&>svg]:size-4 [&>svg]:transition-transform [&>svg]:duration-(--glyph-duration-base) aria-expanded:[&>svg]:rotate-90',
      focusRing,
    ],
    subRow: 'bg-subtle/60',
    subRowCell: 'p-0',
    banner:
      'flex flex-wrap items-center justify-center gap-x-2 gap-y-1 bg-primary/6 px-4 py-2 text-center text-small text-foreground',
    progress: 'pointer-events-none absolute inset-x-0 top-0 z-[3] h-0.5 overflow-hidden',
    progressBar:
      'h-full w-1/3 rounded-pill bg-primary animate-indeterminate motion-none:w-full motion-none:animate-none motion-reduce:w-full motion-reduce:animate-none motion-reduce:opacity-60',
    footer:
      'flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-small text-muted-foreground tabular-nums',
    footerInfo: 'flex flex-wrap items-center gap-x-3 gap-y-1',
    pager: 'flex flex-wrap items-center gap-x-4 gap-y-2',
    pageSize: 'flex items-center gap-2 whitespace-nowrap',
    bulkBar: [
      'pointer-events-auto mx-auto flex max-w-full items-center gap-2 rounded-lg border-border bg-raised py-1.5 pr-1.5 pl-3.5 text-small text-foreground shadow-lg',
      themedBorder,
    ],
    // A zero-height sticky dock: the bar floats over the last rows, and stays on screen
    // while a tall table scrolls, without shifting the layout when it appears.
    bulkDock: 'pointer-events-none sticky bottom-4 z-20 h-0',
    bulkPlacement: 'absolute inset-x-0 bottom-3 flex justify-center px-3',
    bulkCount: 'whitespace-nowrap font-medium tabular-nums',
    cards: 'grid gap-2.5',
    card: [
      'grid gap-2 rounded-md border-border bg-surface p-3.5 text-small data-[state=selected]:border-primary/50 data-[state=selected]:bg-primary/4',
      themedBorder,
    ],
    cardHeader: 'flex min-w-0 items-start gap-3',
    cardTitle: 'min-w-0 flex-1 font-medium text-foreground',
    cardFields: 'grid grid-cols-[minmax(6rem,auto)_1fr] gap-x-3 gap-y-1.5',
    cardLabel: 'text-caption text-muted-foreground',
    cardValue: 'min-w-0 text-foreground',
    loadMore: 'flex justify-center',
  },
  variants: {
    variant: {
      card: {
        root: ['overflow-clip rounded-lg border-border bg-surface shadow-sm', themedBorder],
        toolbar: 'border-b border-border p-3',
        footer: 'border-t border-border px-4 py-2.5',
        loadMore: 'border-t border-border p-2.5',
      },
      plain: {
        root: 'gap-3',
        head: 'bg-background',
        pinned: 'bg-background',
        cards: 'gap-3',
      },
    },
    density: {
      compact: {},
      default: {},
      comfortable: {},
    },
  },
  defaultVariants: { variant: 'card', density: 'default' },
})

/** Row and header heights per density, applied on top of the Table primitives. */
export const densityClasses = {
  compact: { head: 'h-8', cell: 'py-1.5' },
  default: { head: 'h-10', cell: 'py-2.5' },
  comfortable: { head: 'h-11', cell: 'py-3.5' },
} as const

export type DataTableVariants = VariantProps<typeof dataTableStyles>

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    DataTable: StylesEntry<typeof dataTableStyles>
  }
}
