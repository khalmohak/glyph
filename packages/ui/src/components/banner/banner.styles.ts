import type { StylesEntry } from '../../utils/registry'
import { tv, type VariantProps } from '../../utils/tv'

export const bannerStyles = tv({
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
        root: 'border-info/25 bg-info/10 text-[color-mix(in_oklab,var(--color-info)_55%,var(--color-foreground))]',
      },
      success: {
        root: 'border-success/25 bg-success/10 text-[color-mix(in_oklab,var(--color-success)_55%,var(--color-foreground))]',
      },
      warning: {
        root: 'border-warning/30 bg-warning/14 text-[color-mix(in_oklab,var(--color-warning)_50%,var(--color-foreground))]',
      },
      danger: {
        root: 'border-danger/25 bg-danger/10 text-[color-mix(in_oklab,var(--color-danger)_55%,var(--color-foreground))]',
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
