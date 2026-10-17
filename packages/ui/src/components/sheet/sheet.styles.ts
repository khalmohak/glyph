import type { StylesEntry } from '../../utils/registry'
import { focusRing, transition } from '../../utils/styles'
import { tv, type VariantProps } from '../../utils/tv'

export const sheetStyles = /* @__PURE__ */ tv({
  slots: {
    overlay:
      'fixed inset-0 z-50 bg-overlay data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
    content: [
      'fixed z-50 flex flex-col gap-5 border-border bg-surface p-6 text-foreground shadow-lg outline-none',
    ],
    close: [
      'absolute top-4 right-4 inline-flex size-7 cursor-pointer items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground [&>svg]:size-4',
      transition,
      focusRing,
    ],
    header: 'flex flex-col gap-1.5 pr-8',
    title: 'font-display text-h4 text-foreground',
    description: 'text-small text-muted-foreground',
    body: '-mx-6 min-h-0 flex-1 overflow-y-auto px-6 text-small',
    footer: 'mt-auto flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
  },
  variants: {
    // Slides in and out from its edge; Radix keeps it mounted until the exit animation ends.
    side: {
      right: {
        content:
          'inset-y-0 right-0 h-full w-full border-l-(length:--glyph-border-width) data-[state=open]:animate-sheet-in-right data-[state=closed]:animate-sheet-out-right',
      },
      left: {
        content:
          'inset-y-0 left-0 h-full w-full border-r-(length:--glyph-border-width) data-[state=open]:animate-sheet-in-left data-[state=closed]:animate-sheet-out-left',
      },
      top: {
        content:
          'inset-x-0 top-0 max-h-[85dvh] border-b-(length:--glyph-border-width) data-[state=open]:animate-sheet-in-top data-[state=closed]:animate-sheet-out-top',
      },
      bottom: {
        content:
          'inset-x-0 bottom-0 max-h-[85dvh] rounded-t-xl border-t-(length:--glyph-border-width) data-[state=open]:animate-sheet-in-bottom data-[state=closed]:animate-sheet-out-bottom',
      },
    },
    size: { sm: {}, md: {}, lg: {}, xl: {} },
  },
  compoundVariants: [
    { side: ['left', 'right'], size: 'sm', class: { content: 'sm:max-w-sm' } },
    { side: ['left', 'right'], size: 'md', class: { content: 'sm:max-w-md' } },
    { side: ['left', 'right'], size: 'lg', class: { content: 'sm:max-w-xl' } },
    { side: ['left', 'right'], size: 'xl', class: { content: 'sm:max-w-3xl' } },
  ],
  defaultVariants: { side: 'right', size: 'md' },
})

export type SheetVariants = VariantProps<typeof sheetStyles>

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    Sheet: StylesEntry<typeof sheetStyles>
  }
}
