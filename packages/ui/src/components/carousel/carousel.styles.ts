import type { StylesEntry } from '../../utils/registry'
import { focusRing, transition } from '../../utils/styles'
import { tv, type VariantProps } from '../../utils/tv'

export const carouselStyles = tv({
  slots: {
    root: 'relative',
    viewport: 'overflow-hidden rounded-lg',
    container: 'flex',
    item: 'min-w-0 shrink-0 grow-0 basis-full',
    control: 'absolute z-10 border-border bg-surface/85 shadow-sm backdrop-blur disabled:opacity-0',
    dots: 'mt-3 flex items-center justify-center gap-1.5',
    dot: [
      'h-2 w-2 cursor-pointer rounded-pill bg-border-strong',
      transition,
      focusRing,
      'hover:bg-muted-foreground aria-[current=true]:w-5 aria-[current=true]:bg-primary',
    ],
  },
  variants: {
    orientation: {
      horizontal: {
        container: '-ml-4',
        item: 'pl-4',
        control: 'top-1/2 -translate-y-1/2',
      },
      vertical: {
        container: '-mt-4 h-full flex-col',
        item: 'pt-4',
        control: 'left-1/2 -translate-x-1/2 [&_svg]:rotate-90',
      },
    },
  },
  defaultVariants: { orientation: 'horizontal' },
})

export type CarouselVariants = VariantProps<typeof carouselStyles>

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    Carousel: StylesEntry<typeof carouselStyles>
  }
}
