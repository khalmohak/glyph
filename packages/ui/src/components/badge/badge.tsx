import { Slot } from 'radix-ui'
import type { ComponentProps } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { type BadgeVariants, badgeStyles } from './badge.styles'

export interface BadgeProps extends ComponentProps<'span'>, BadgeVariants {
  /** Leading status dot in the badge's color. */
  dot?: boolean
  asChild?: boolean
}

export function Badge(inProps: BadgeProps) {
  const [props, slots] = useComponentConfig('Badge', inProps)
  const { tone, variant, dot, asChild, className, children, ...rest } = props
  const s = badgeStyles({ tone, variant })
  const Comp = asChild ? Slot.Root : 'span'
  return (
    <Comp
      data-slot="badge"
      data-tone={tone ?? 'neutral'}
      className={s.base({ class: [slots.base, className] })}
      {...rest}
    >
      {dot && (
        <span data-slot="badge-dot" className={s.dot({ class: slots.dot })} aria-hidden="true" />
      )}
      <Slot.Slottable>{children}</Slot.Slottable>
    </Comp>
  )
}
