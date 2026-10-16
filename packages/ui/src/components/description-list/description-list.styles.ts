import type { StylesEntry } from '../../utils/registry'
import { tv, type VariantProps } from '../../utils/tv'

export const descriptionListStyles = tv({
  slots: {
    root: 'grid w-full',
    item: 'grid min-w-0 gap-1',
    term: 'text-small text-muted-foreground',
    details: 'min-w-0 break-words text-small text-foreground',
  },
  variants: {
    layout: {
      stacked: { root: 'gap-4' },
      inline: { item: 'sm:grid-cols-[minmax(0,12rem)_1fr] sm:gap-4' },
    },
    dividers: {
      true: { root: 'gap-0 divide-y divide-border', item: 'py-3 first:pt-0 last:pb-0' },
      false: {},
    },
  },
  compoundVariants: [{ layout: 'inline', dividers: false, class: { root: 'gap-3' } }],
  defaultVariants: { layout: 'stacked', dividers: false },
})

export type DescriptionListVariants = VariantProps<typeof descriptionListStyles>

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    DescriptionList: StylesEntry<typeof descriptionListStyles>
  }
}
