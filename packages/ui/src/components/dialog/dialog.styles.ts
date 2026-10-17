import type { StylesEntry } from '../../utils/registry'
import {
  dialogMotion,
  focusRing,
  overlayMotion,
  themedBorder,
  transition,
} from '../../utils/styles'
import { tv, type VariantProps } from '../../utils/tv'

export const dialogStyles = /* @__PURE__ */ tv({
  slots: {
    overlay: ['fixed inset-0 z-50 bg-overlay', overlayMotion],
    content: [
      'fixed top-1/2 left-1/2 z-50 grid max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 gap-5 overflow-y-auto',
      'rounded-xl border-border bg-surface p-6 text-foreground shadow-lg outline-none',
      dialogMotion,
      themedBorder,
    ],
    close: [
      'absolute top-4 right-4 inline-flex size-7 cursor-pointer items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground [&>svg]:size-4',
      transition,
      focusRing,
    ],
    header: 'flex flex-col gap-1.5 pr-8',
    title: 'font-display text-h4 text-foreground',
    description: 'text-small text-muted-foreground',
    body: 'min-w-0 text-small text-foreground',
    footer: 'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
  },
  variants: {
    size: {
      sm: { content: 'max-w-sm' },
      md: { content: 'max-w-lg' },
      lg: { content: 'max-w-2xl' },
      xl: { content: 'max-w-4xl' },
    },
  },
  defaultVariants: { size: 'md' },
})

export type DialogVariants = VariantProps<typeof dialogStyles>

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    Dialog: StylesEntry<typeof dialogStyles>
  }
}
