import type { StylesEntry } from '../../utils/registry'
import { tv, type VariantProps } from '../../utils/tv'

export const bannerStyles = /* @__PURE__ */ tv({
  slots: {
    root: ['w-full border-b-(length:--glyph-border-width) text-small'],
    inner: 'mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-2.5 sm:px-6',
    icon: 'flex size-4 shrink-0 items-center justify-center [&>svg]:size-4',
    content: 'min-w-0 flex-1 [&_a]:font-medium [&_a]:underline [&_a]:underline-offset-2',
    action: 'flex shrink-0 items-center gap-2',
    dismiss: '-my-1 -mr-2 shrink-0 text-current hover:bg-current/10 hover:text-current',
  },
  variants: {
    tone: {
      neutral: { root: 'border-border bg-subtle text-foreground', icon: 'text-muted-foreground' },
      primary: { root: 'border-primary bg-primary text-primary-foreground' },
      info: {
        root: 'border-info/25 bg-info/10 text-info-text',
      },
      success: {
        root: 'border-success/25 bg-success/10 text-success-text',
      },
      warning: {
        root: 'border-warning/30 bg-warning/14 text-warning-text',
      },
      danger: {
        root: 'border-danger/25 bg-danger/10 text-danger-text',
      },
    },
  },
  defaultVariants: { tone: 'neutral' },
})

export type BannerVariants = VariantProps<typeof bannerStyles>

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    Banner: StylesEntry<typeof bannerStyles>
  }
}
