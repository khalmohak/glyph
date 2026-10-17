import { themedBorder, transition } from '../../utils/styles'
import { tv, type VariantProps } from '../../utils/tv'

export const cardStyles = /* @__PURE__ */ tv({
  slots: {
    root: ['flex flex-col rounded-lg text-foreground', themedBorder, transition],
    header: 'flex flex-col gap-1',
    title: 'font-display text-h4 text-foreground',
    description: 'text-small text-muted-foreground',
    body: 'min-w-0',
    footer: 'mt-auto flex items-center gap-2 pt-1',
  },
  variants: {
    variant: {
      outline: { root: 'border-border bg-surface' },
      elevated: { root: 'border-border bg-surface shadow-md' },
      ghost: { root: 'border-transparent bg-subtle' },
      interactive: {
        root: 'cursor-pointer border-border bg-surface shadow-sm hover:-translate-y-0.5 hover:border-border-strong hover:shadow-lg',
      },
    },
    padding: {
      none: { root: 'gap-0 p-0' },
      sm: { root: 'gap-3 p-4' },
      md: { root: 'gap-4 p-6' },
      lg: { root: 'gap-5 p-8' },
    },
  },
  defaultVariants: { variant: 'elevated', padding: 'md' },
})

export type CardVariants = VariantProps<typeof cardStyles>
