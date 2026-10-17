import type { StylesEntry } from '../../utils/registry'
import { focusRing, themedBorder } from '../../utils/styles'
import { tv, type VariantProps } from '../../utils/tv'

export const chartStyles = /* @__PURE__ */ tv({
  slots: {
    root: 'm-0 grid min-w-0 gap-3',
    caption: 'grid gap-0.5',
    title: 'text-small font-medium text-foreground',
    description: 'text-caption text-muted-foreground',
    plot: [
      'relative min-w-0 [&_.recharts-surface]:overflow-visible',
      '[&_.recharts-text]:fill-muted-foreground [&_.recharts-cartesian-axis-tick_text]:tabular-nums',
      '[&_.recharts-layer]:outline-none [&_.recharts-sector]:outline-none [&_.recharts-rectangle]:outline-none',
    ],
    state: 'flex items-center justify-center',
    skeleton: 'h-full w-full rounded-lg',
    legend: 'flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-muted-foreground',
    legendItem: 'inline-flex items-center gap-1.5',
    legendButton: [
      '-mx-1 inline-flex cursor-pointer items-center gap-1.5 rounded-xs px-1 py-0.5 transition-opacity hover:text-foreground',
      'aria-[pressed=false]:opacity-45 aria-[pressed=false]:line-through aria-[pressed=false]:decoration-faint-foreground',
      focusRing,
    ],
    swatch: 'size-2.5 shrink-0 rounded-[2px]',
    tooltip: [
      'grid min-w-36 gap-1.5 rounded-lg border-border bg-raised px-3 py-2 text-caption text-foreground shadow-lg',
      themedBorder,
    ],
    tooltipLabel: 'font-medium text-foreground',
    tooltipRow: 'flex items-center gap-2',
    tooltipName: 'flex-1 text-muted-foreground',
    tooltipValue: 'font-mono font-medium tabular-nums text-foreground',
    tooltipTotal: 'mt-0.5 flex items-center gap-2 border-t border-border pt-1.5',
    center:
      'pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center',
    table: 'max-h-96 overflow-auto rounded-lg border-(length:--glyph-border-width) border-border',
    srOnly: 'sr-only',
  },
})

export type ChartVariants = VariantProps<typeof chartStyles>

export const chartCardStyles = /* @__PURE__ */ tv({
  slots: {
    root: 'min-w-0',
    header: 'flex flex-wrap items-start justify-between gap-3',
    heading: 'grid min-w-0 gap-1',
    controls: 'flex flex-wrap items-center gap-2',
    body: 'min-w-0',
  },
})

export type ChartCardVariants = VariantProps<typeof chartCardStyles>

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    Chart: StylesEntry<typeof chartStyles>
    ChartCard: StylesEntry<typeof chartCardStyles>
  }
}
