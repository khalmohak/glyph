import type { StylesEntry } from '../../utils/registry'
import { themedBorder } from '../../utils/styles'
import { tv, type VariantProps } from '../../utils/tv'

export const timelineStyles = /* @__PURE__ */ tv({
  slots: {
    root: 'grid',
    item: 'group/item relative grid grid-cols-[auto_1fr] gap-x-3',
    rail: 'flex flex-col items-center',
    marker: [
      'z-10 flex size-6 shrink-0 items-center justify-center rounded-pill bg-surface [&>svg]:size-3.5',
      themedBorder,
    ],
    dot: 'size-2 rounded-pill bg-current',
    connector: 'my-1 w-px flex-1 bg-border group-last/item:hidden',
    content: 'grid min-w-0 gap-0.5 pt-0.5 pb-6 group-last/item:pb-0',
    header: 'flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5',
    title: 'text-small font-medium text-foreground',
    time: 'font-mono text-caption text-faint-foreground tabular-nums',
    description: 'text-small text-muted-foreground',
  },
  variants: {
    tone: {
      neutral: { marker: 'border-border text-muted-foreground' },
      primary: {
        marker:
          'border-primary/40 text-[color-mix(in_oklab,var(--color-primary)_80%,var(--color-foreground))]',
      },
      info: {
        marker:
          'border-info/40 text-[color-mix(in_oklab,var(--color-info)_80%,var(--color-foreground))]',
      },
      success: {
        marker:
          'border-success/40 text-[color-mix(in_oklab,var(--color-success)_80%,var(--color-foreground))]',
      },
      warning: {
        marker:
          'border-warning/50 text-[color-mix(in_oklab,var(--color-warning)_80%,var(--color-foreground))]',
      },
      danger: {
        marker:
          'border-danger/40 text-[color-mix(in_oklab,var(--color-danger)_80%,var(--color-foreground))]',
      },
    },
  },
  defaultVariants: { tone: 'neutral' },
})

export type TimelineVariants = VariantProps<typeof timelineStyles>

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    Timeline: StylesEntry<typeof timelineStyles>
  }
}
