import { Slot } from 'radix-ui'
import type { ComponentProps } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { type TextVariants, textStyles } from './text.styles'

export interface TextProps extends ComponentProps<'p'>, TextVariants {
  /** Render the child element (e.g. `<span>`, `<label>`) with text styles instead of a `<p>`. */
  asChild?: boolean
}

export function Text(inProps: TextProps) {
  const [props, slots] = useComponentConfig('Text', inProps)
  const { size, tone, weight, mono, truncate, asChild, className, ...rest } = props
  const s = textStyles({ size, tone, weight, mono, truncate })
  const Comp = asChild ? Slot.Root : 'p'
  return <Comp data-slot="text" className={s.base({ class: [slots.base, className] })} {...rest} />
}
