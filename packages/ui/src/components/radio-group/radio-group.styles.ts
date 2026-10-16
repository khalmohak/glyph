import type { StylesEntry } from '../../utils/registry'
import { focusRing, themedBorder, transition } from '../../utils/styles'
import { tv, type VariantProps } from '../../utils/tv'

const control = [
  'mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-pill border-input bg-surface shadow-xs',
  themedBorder,
  transition,
]

export const radioGroupStyles = tv({
  slots: {
    root: '',
    option: 'flex items-start gap-2.5',
    control: [
      ...control,
      focusRing,
      'peer cursor-pointer hover:border-border-strong aria-invalid:border-danger',
      'data-[state=checked]:border-primary disabled:cursor-not-allowed disabled:opacity-50',
    ],
    indicator:
      'flex size-full items-center justify-center after:block after:size-2 after:rounded-pill after:bg-primary',
    text: 'grid gap-0.5',
    label:
      'cursor-pointer text-small font-medium text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-60',
    description: 'text-small text-faint-foreground',
    card: [
      'group relative flex w-full cursor-pointer items-start gap-3 rounded-lg border-border bg-surface p-4 text-left shadow-xs',
      themedBorder,
      transition,
      focusRing,
      'hover:border-border-strong',
      'data-[state=checked]:border-primary data-[state=checked]:ring-1 data-[state=checked]:ring-primary',
      'disabled:cursor-not-allowed disabled:opacity-50',
    ],
    cardControl: [...control, 'group-data-[state=checked]:border-primary'],
  },
  variants: {
    orientation: {
      vertical: { root: 'grid gap-3' },
      horizontal: { root: 'flex flex-wrap gap-x-5 gap-y-3' },
    },
    variant: {
      default: {},
      card: {},
    },
  },
  compoundVariants: [
    {
      variant: 'card',
      orientation: 'horizontal',
      class: { root: 'grid grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-3' },
    },
  ],
  defaultVariants: { orientation: 'vertical', variant: 'default' },
})

export type RadioGroupVariants = VariantProps<typeof radioGroupStyles>

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    RadioGroup: StylesEntry<typeof radioGroupStyles>
  }
}
