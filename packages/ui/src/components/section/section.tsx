import { Slot } from 'radix-ui'
import type { ComponentProps } from 'react'
import { tv, type VariantProps } from '../../utils/tv'

export const sectionStyles = /* @__PURE__ */ tv({
  base: 'w-full',
  variants: {
    spacing: {
      none: 'py-0',
      sm: 'py-10 sm:py-12',
      md: 'py-16 sm:py-20',
      lg: 'py-20 sm:py-28',
    },
    tone: {
      default: '',
      subtle: 'bg-subtle',
    },
    divided: { true: 'border-t-(length:--glyph-border-width) border-border' },
  },
  defaultVariants: { spacing: 'md', tone: 'default' },
})

export interface SectionProps
  extends ComponentProps<'section'>,
    VariantProps<typeof sectionStyles> {
  asChild?: boolean
}

/** A full-width page band with consistent vertical rhythm. Put a Container inside. */
export function Section({ spacing, tone, divided, asChild, className, ...props }: SectionProps) {
  const Comp = asChild ? Slot.Root : 'section'
  return (
    <Comp
      data-slot="section"
      className={sectionStyles({ spacing, tone, divided, class: className })}
      {...props}
    />
  )
}
