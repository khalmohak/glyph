import { tv, type VariantProps } from '../../utils/tv'

export const eyebrowStyles = tv({
  slots: { base: 'font-mono text-caption uppercase tracking-[0.12em]' },
  variants: {
    tone: {
      muted: { base: 'text-muted-foreground' },
      primary: { base: 'text-primary' },
    },
  },
  defaultVariants: { tone: 'muted' },
})

export type EyebrowVariants = VariantProps<typeof eyebrowStyles>
