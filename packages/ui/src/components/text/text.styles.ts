import { tv, type VariantProps } from '../../utils/tv'

export const textStyles = /* @__PURE__ */ tv({
  slots: { base: '' },
  variants: {
    size: {
      lead: { base: 'text-lead' },
      body: { base: 'text-body' },
      small: { base: 'text-small' },
      caption: { base: 'text-caption' },
    },
    tone: {
      default: { base: 'text-foreground' },
      muted: { base: 'text-muted-foreground' },
      faint: { base: 'text-faint-foreground' },
      primary: { base: 'text-primary-text' },
      success: { base: 'text-success-text' },
      warning: { base: 'text-warning-text' },
      danger: { base: 'text-danger-text' },
    },
    weight: {
      regular: { base: 'font-normal' },
      medium: { base: 'font-medium' },
      semibold: { base: 'font-semibold' },
    },
    mono: { true: { base: 'font-mono' } },
    truncate: { true: { base: 'truncate' } },
  },
  defaultVariants: { size: 'body', tone: 'default' },
})

export type TextVariants = VariantProps<typeof textStyles>
