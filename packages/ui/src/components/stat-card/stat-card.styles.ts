import type { StylesEntry } from '../../utils/registry'
import { tv, type VariantProps } from '../../utils/tv'

export const statCardStyles = tv({
  slots: {
    root: 'gap-2',
    header: 'flex items-center justify-between gap-2',
    label: 'text-small text-muted-foreground',
    icon: 'flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground [&>svg]:size-4',
    valueRow: 'flex flex-wrap items-baseline gap-x-2 gap-y-1',
    value: 'font-display text-h2 tabular-nums text-foreground',
    delta: 'gap-1 [&>svg]:size-3',
    description: 'text-small text-faint-foreground',
    chart: 'mt-1 min-w-0 text-primary',
  },
})

export type StatCardVariants = VariantProps<typeof statCardStyles>

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    StatCard: StylesEntry<typeof statCardStyles>
  }
}
