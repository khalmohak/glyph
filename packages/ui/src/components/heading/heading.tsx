import { Slot } from 'radix-ui'
import type { ComponentProps } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { type HeadingVariants, headingStyles } from './heading.styles'

type Level = 1 | 2 | 3 | 4 | 5 | 6
type Size = NonNullable<HeadingVariants['size']>

const sizeForLevel: Record<Level, Size> = { 1: 'h1', 2: 'h2', 3: 'h3', 4: 'h4', 5: 'h4', 6: 'h4' }

export interface HeadingProps extends ComponentProps<'h2'>, HeadingVariants {
  /** Document outline level (h1–h6). Visual size follows it unless `size` is set. */
  level?: Level
  asChild?: boolean
}

/** A heading whose semantic level and visual size are set independently. */
export function Heading(inProps: HeadingProps) {
  const [props, slots] = useComponentConfig('Heading', inProps)
  const { level = 2, size, asChild, className, ...rest } = props
  const s = headingStyles({ size: size ?? sizeForLevel[level] })
  const Comp = asChild ? Slot.Root : (`h${level}` as const)
  return (
    <Comp data-slot="heading" className={s.base({ class: [slots.base, className] })} {...rest} />
  )
}
