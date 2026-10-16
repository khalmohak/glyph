import { Slot } from 'radix-ui'
import type { ComponentProps } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { type EyebrowVariants, eyebrowStyles } from './eyebrow.styles'

export interface EyebrowProps extends ComponentProps<'p'>, EyebrowVariants {
  asChild?: boolean
}

/** Small uppercase label that sits above a heading. */
export function Eyebrow(inProps: EyebrowProps) {
  const [props, slots] = useComponentConfig('Eyebrow', inProps)
  const { tone, asChild, className, ...rest } = props
  const s = eyebrowStyles({ tone })
  const Comp = asChild ? Slot.Root : 'p'
  return (
    <Comp data-slot="eyebrow" className={s.base({ class: [slots.base, className] })} {...rest} />
  )
}
