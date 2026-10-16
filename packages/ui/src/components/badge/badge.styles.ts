import { themedBorder } from '../../utils/styles'
import { tv, type VariantProps } from '../../utils/tv'

// Tinted text is mixed toward the foreground so it stays readable on light and dark surfaces.
const tones = {
  neutral: {
    soft: 'bg-muted text-muted-foreground',
    solid: 'bg-secondary text-secondary-foreground',
    outline: 'border-border-strong text-foreground',
  },
  primary: {
    soft: 'bg-primary/14 text-[color-mix(in_oklab,var(--color-primary)_62%,var(--color-foreground))]',
    solid: 'bg-primary text-primary-foreground',
    outline:
      'border-primary/50 text-[color-mix(in_oklab,var(--color-primary)_62%,var(--color-foreground))]',
  },
  success: {
    soft: 'bg-success/14 text-[color-mix(in_oklab,var(--color-success)_62%,var(--color-foreground))]',
    solid: 'bg-success text-success-foreground',
    outline:
      'border-success/50 text-[color-mix(in_oklab,var(--color-success)_62%,var(--color-foreground))]',
  },
  warning: {
    soft: 'bg-warning/16 text-[color-mix(in_oklab,var(--color-warning)_62%,var(--color-foreground))]',
    solid: 'bg-warning text-warning-foreground',
    outline:
      'border-warning/50 text-[color-mix(in_oklab,var(--color-warning)_62%,var(--color-foreground))]',
  },
  danger: {
    soft: 'bg-danger/14 text-[color-mix(in_oklab,var(--color-danger)_62%,var(--color-foreground))]',
    solid: 'bg-danger text-danger-foreground',
    outline:
      'border-danger/50 text-[color-mix(in_oklab,var(--color-danger)_62%,var(--color-foreground))]',
  },
  info: {
    soft: 'bg-info/14 text-[color-mix(in_oklab,var(--color-info)_62%,var(--color-foreground))]',
    solid: 'bg-info text-info-foreground',
    outline:
      'border-info/50 text-[color-mix(in_oklab,var(--color-info)_62%,var(--color-foreground))]',
  },
} as const

type Tone = keyof typeof tones
type Variant = keyof (typeof tones)[Tone]

export const badgeStyles = tv({
  slots: {
    base: [
      'inline-flex h-5.5 w-fit shrink-0 items-center gap-1.5 whitespace-nowrap rounded-pill border-transparent px-2',
      'text-caption tabular-nums',
      themedBorder,
    ],
    dot: 'size-1.5 shrink-0 rounded-pill bg-current',
  },
  variants: {
    tone: { neutral: {}, primary: {}, success: {}, warning: {}, danger: {}, info: {} },
    variant: { soft: {}, solid: {}, outline: { base: 'bg-transparent' } },
  },
  compoundVariants: (Object.keys(tones) as Tone[]).flatMap((tone) =>
    (Object.keys(tones[tone]) as Variant[]).map((variant) => ({
      tone,
      variant,
      class: { base: tones[tone][variant] },
    })),
  ),
  defaultVariants: { tone: 'neutral', variant: 'soft' },
})

export type BadgeVariants = VariantProps<typeof badgeStyles>
