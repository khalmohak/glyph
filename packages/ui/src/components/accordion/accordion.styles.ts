import type { StylesEntry } from '../../utils/registry'
import { focusRing, themedBorder, transition } from '../../utils/styles'
import { tv, type VariantProps } from '../../utils/tv'

export const accordionStyles = tv({
  slots: {
    root: 'w-full',
    item: '',
    header: 'flex',
    trigger: [
      'group flex flex-1 cursor-pointer items-center justify-between gap-4 rounded-xs py-4 text-left text-body font-medium text-foreground',
      transition,
      focusRing,
      'hover:text-foreground/80 disabled:cursor-not-allowed disabled:opacity-50',
    ],
    chevron:
      'size-4 shrink-0 text-faint-foreground transition-transform duration-(--glyph-duration-base) ease-standard group-data-[state=open]:rotate-180',
    content:
      'overflow-hidden text-small text-muted-foreground data-[state=open]:animate-collapse-down data-[state=closed]:animate-collapse-up',
    // Height animates open and closed using Radix's measured content height.
    contentInner: 'pb-4',
  },
  variants: {
    variant: {
      default: { item: 'border-b border-border last:border-b-0' },
      separated: {
        root: 'grid gap-2',
        item: ['rounded-lg border-border bg-surface px-4 shadow-xs', themedBorder],
      },
    },
  },
  defaultVariants: { variant: 'default' },
})

export type AccordionVariants = VariantProps<typeof accordionStyles>

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    Accordion: StylesEntry<typeof accordionStyles>
  }
}
