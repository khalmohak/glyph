import { tv, type VariantProps } from '../../utils/tv'

export const spinnerStyles = /* @__PURE__ */ tv({
  slots: {
    base: 'inline-block shrink-0 animate-spin',
    track: 'opacity-20',
    arc: '',
  },
  variants: {
    size: {
      sm: { base: 'size-3.5' },
      md: { base: 'size-4' },
      lg: { base: 'size-6' },
    },
  },
  defaultVariants: { size: 'md' },
})

export type SpinnerVariants = VariantProps<typeof spinnerStyles>
