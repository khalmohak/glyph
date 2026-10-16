import type { StylesEntry } from '../../utils/registry'
import { themedBorder } from '../../utils/styles'
import { tv } from '../../utils/tv'

export const alertDialogStyles = tv({
  slots: {
    overlay: 'fixed inset-0 z-50 animate-fade-in bg-overlay',
    content: [
      'fixed top-1/2 left-1/2 z-50 grid w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-5',
      'rounded-xl border-border bg-surface p-6 text-foreground shadow-lg outline-none animate-pop-in',
      themedBorder,
    ],
    header: 'flex flex-col gap-1.5',
    title: 'font-display text-h4 text-foreground',
    description: 'text-small text-muted-foreground',
    footer: 'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
  },
})

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    AlertDialog: StylesEntry<typeof alertDialogStyles>
  }
}
