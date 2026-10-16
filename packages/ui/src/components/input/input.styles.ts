import { themedBorder, transition } from '../../utils/styles'
import { tv, type VariantProps } from '../../utils/tv'

/** Shared by Input, Textarea and the Select trigger so all fields look alike. */
export const fieldControl = [
  'w-full rounded-md border-input bg-surface text-foreground shadow-xs',
  themedBorder,
  transition,
  'hover:border-border-strong',
  'data-invalid:border-danger aria-invalid:border-danger',
]

export const inputStyles = tv({
  slots: {
    root: [
      ...fieldControl,
      'flex items-center gap-2 px-3',
      'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20',
      'data-invalid:focus-within:ring-danger/20',
      'has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-50',
    ],
    input:
      'h-full w-full min-w-0 bg-transparent text-foreground outline-none placeholder:text-faint-foreground disabled:cursor-not-allowed',
    adornment: 'flex shrink-0 items-center text-faint-foreground [&>svg]:size-4',
  },
  variants: {
    size: {
      sm: { root: 'h-(--glyph-control-sm) text-small' },
      md: { root: 'h-(--glyph-control-md) text-small' },
      lg: { root: 'h-(--glyph-control-lg) text-body' },
    },
  },
  defaultVariants: { size: 'md' },
})

export type InputVariants = VariantProps<typeof inputStyles>
