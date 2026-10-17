import { focusRing, themedBorder, transition } from '../../utils/styles'
import { tv, type VariantProps } from '../../utils/tv'

export const buttonStyles = /* @__PURE__ */ tv({
  slots: {
    base: [
      'relative inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap',
      'rounded-md border-transparent font-medium',
      themedBorder,
      transition,
      focusRing,
      'disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 aria-busy:cursor-progress',
      // Press feedback. CSS only, so Button stays free of animation libraries.
      'active:scale-[0.98] motion-expressive:active:scale-[0.95]',
    ],
    icon: 'inline-flex size-4 shrink-0 items-center justify-center [&>svg]:size-full',
  },
  variants: {
    variant: {
      primary: { base: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/88' },
      secondary: { base: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/88' },
      outline: {
        base: 'border-border bg-surface text-foreground shadow-xs hover:border-border-strong hover:bg-muted',
      },
      ghost: { base: 'text-muted-foreground hover:bg-muted hover:text-foreground' },
      danger: { base: 'bg-danger text-danger-foreground shadow-sm hover:bg-danger/88' },
      link: {
        base: 'h-auto px-0 text-primary-text underline-offset-4 shadow-none hover:underline active:scale-100 motion-expressive:active:scale-100',
      },
    },
    size: {
      sm: { base: 'h-(--glyph-control-sm) px-3 text-small', icon: 'size-3.5' },
      md: { base: 'h-(--glyph-control-md) px-4 text-small' },
      lg: { base: 'h-(--glyph-control-lg) px-5 text-body', icon: 'size-[1.125rem]' },
    },
    iconOnly: { true: { base: 'px-0' } },
    fullWidth: { true: { base: 'w-full' } },
  },
  compoundVariants: [
    { iconOnly: true, size: 'sm', class: { base: 'w-(--glyph-control-sm)' } },
    { iconOnly: true, size: 'md', class: { base: 'w-(--glyph-control-md)' } },
    { iconOnly: true, size: 'lg', class: { base: 'w-(--glyph-control-lg)' } },
  ],
  defaultVariants: { variant: 'primary', size: 'md' },
})

export type ButtonVariants = VariantProps<typeof buttonStyles>
