import type { StylesEntry } from '../../utils/registry'
import { focusRing } from '../../utils/styles'
import { tv, type VariantProps } from '../../utils/tv'
import { fieldControl } from '../input/input.styles'

export const numberInputStyles = /* @__PURE__ */ tv({
  slots: {
    root: [
      ...fieldControl,
      'flex items-center gap-2 pl-3',
      'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20',
      'data-invalid:focus-within:ring-danger/20',
      'has-[input:disabled]:cursor-not-allowed has-[input:disabled]:opacity-50',
    ],
    input:
      'h-full w-full min-w-0 bg-transparent tabular-nums text-foreground outline-none placeholder:text-faint-foreground disabled:cursor-not-allowed',
    adornment: 'flex shrink-0 items-center text-faint-foreground [&>svg]:size-4',
    steppers: 'flex h-full shrink-0 items-stretch border-l border-input',
    stepper: [
      'inline-flex w-8 cursor-pointer items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground',
      'disabled:pointer-events-none disabled:opacity-40 [&>svg]:size-3.5 last:rounded-r-[calc(var(--radius-md)-1px)]',
      focusRing,
    ],
  },
  variants: {
    size: {
      sm: { root: 'h-(--glyph-control-sm) text-small' },
      md: { root: 'h-(--glyph-control-md) text-small' },
      lg: { root: 'h-(--glyph-control-lg) text-body', stepper: 'w-10' },
    },
  },
  defaultVariants: { size: 'md' },
})

export type NumberInputVariants = VariantProps<typeof numberInputStyles>

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    NumberInput: StylesEntry<typeof numberInputStyles>
  }
}
