import { Slot } from 'radix-ui'
import type { ComponentProps } from 'react'
import { tv, type VariantProps } from '../../utils/tv'

export const containerStyles = /* @__PURE__ */ tv({
  base: 'mx-auto w-full px-4 sm:px-6',
  variants: {
    size: {
      sm: 'max-w-2xl',
      md: 'max-w-3xl',
      lg: 'max-w-5xl',
      xl: 'max-w-7xl',
      full: 'max-w-none',
    },
  },
  defaultVariants: { size: 'xl' },
})

export interface ContainerProps
  extends ComponentProps<'div'>,
    VariantProps<typeof containerStyles> {
  asChild?: boolean
}

/** Centers content at a readable max width with consistent side gutters. */
export function Container({ size, asChild, className, ...props }: ContainerProps) {
  const Comp = asChild ? Slot.Root : 'div'
  return (
    <Comp
      data-slot="container"
      className={containerStyles({ size, class: className })}
      {...props}
    />
  )
}
