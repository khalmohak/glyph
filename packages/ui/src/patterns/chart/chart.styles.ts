import type { StylesEntry } from '../../utils/registry'
import { themedBorder } from '../../utils/styles'
import { tv, type VariantProps } from '../../utils/tv'

export const chartStyles = tv({
  slots: {
    root: 'm-0 grid min-w-0 gap-3',
    caption: 'grid gap-0.5',
    title: 'text-small font-medium text-foreground',
    description: 'text-caption text-muted-foreground',
    plot: 'min-w-0 [&_.recharts-surface]:overflow-visible [&_.recharts-text]:fill-muted-foreground',
    legend: 'flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-muted-foreground',
    legendItem: 'inline-flex items-center gap-1.5',
    swatch: 'size-2.5 shrink-0 rounded-[2px]',
    tooltip: [
      'grid min-w-36 gap-1.5 rounded-md border-border bg-raised px-3 py-2 text-caption text-foreground shadow-lg',
      themedBorder,
    ],
    tooltipLabel: 'font-medium text-foreground',
    tooltipRow: 'flex items-center gap-2',
    tooltipName: 'flex-1 text-muted-foreground',
    tooltipValue: 'font-mono font-medium tabular-nums text-foreground',
    center:
      'pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center',
    srOnly: 'sr-only',
  },
})

export type ChartVariants = VariantProps<typeof chartStyles>

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    Chart: StylesEntry<typeof chartStyles>
  }
}
