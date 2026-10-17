import { tv, type VariantProps } from '../../utils/tv'

export const eyebrowStyles = /* @__PURE__ */ tv({
  slots: { base: 'font-mono text-caption uppercase tracking-[0.12em]' },
  variants: {
    tone: {
      muted: { base: 'text-muted-foreground' },
      primary: { base: 'text-primary-text' },
    },
  },
  defaultVariants: { tone: 'muted' },
})

export type EyebrowVariants = VariantProps<typeof eyebrowStyles>
