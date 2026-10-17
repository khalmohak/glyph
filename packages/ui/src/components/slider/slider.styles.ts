import type { StylesEntry } from '../../utils/registry'
import { tv, type VariantProps } from '../../utils/tv'

export const sliderStyles = /* @__PURE__ */ tv({
  slots: {
    wrapper: 'grid w-full gap-1.5',
    root: 'relative flex h-5 w-full touch-none select-none items-center data-disabled:cursor-not-allowed data-disabled:opacity-50',
    track: 'relative h-1.5 w-full grow overflow-hidden rounded-pill bg-muted',
    range: 'absolute h-full bg-primary',
    thumb: [
      'relative block size-4 cursor-grab rounded-pill border-2 border-primary bg-background shadow-sm outline-none active:cursor-grabbing',
      'transition-[box-shadow] duration-(--glyph-duration-fast) ease-standard',
      'hover:ring-4 hover:ring-ring/15 focus-visible:ring-4 focus-visible:ring-ring/30',
      'data-disabled:cursor-not-allowed',
    ],
    value:
      'pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-xs bg-secondary px-1.5 py-0.5 font-mono text-caption text-secondary-foreground tabular-nums',
    marks: 'relative h-4 w-full',
    mark: 'absolute top-0 -translate-x-1/2 text-caption text-faint-foreground tabular-nums',
  },
  variants: {
    showValue: { true: { wrapper: 'pt-7' } },
  },
})

export type SliderVariants = VariantProps<typeof sliderStyles>

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    Slider: StylesEntry<typeof sliderStyles>
  }
}
