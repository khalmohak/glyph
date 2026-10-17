import { Slot } from 'radix-ui'
import { type ComponentProps, type CSSProperties, useRef } from 'react'
import { composeRefs } from '../utils/compose-refs'
import { type RevealOptions, useReveal } from './use-reveal'

export interface RevealProps extends ComponentProps<'div'>, RevealOptions {
  /** Delay before the entrance starts, in milliseconds. */
  delay?: number
  /** Distance it rises from, in px or any CSS length. Defaults to the motion level's. */
  y?: number | string
  /** Start slightly smaller, for cards and media. */
  scale?: boolean
  asChild?: boolean
}

const length = (value: number | string) => (typeof value === 'number' ? `${value}px` : value)

/**
 * Fades and rises its content in when it scrolls into view. Uses the theme's spring, follows
 * the motion level, and leaves content visible when motion is off or JavaScript hasn't run.
 */
export function Reveal({
  delay,
  y,
  scale,
  once,
  amount,
  enabled,
  asChild,
  style,
  ref,
  ...props
}: RevealProps) {
  const local = useRef<HTMLDivElement>(null)
  useReveal(local, 'reveal', { once, amount, enabled })
  const Comp = asChild ? Slot.Root : 'div'
  const vars = {
    ...(delay !== undefined && { '--glyph-reveal-delay': `${delay}ms` }),
    ...(y !== undefined && { '--glyph-reveal-y': length(y) }),
    ...(scale && { '--glyph-reveal-scale': 'var(--glyph-motion-scale)' }),
  } as CSSProperties
  return (
    <Comp
      data-slot="reveal"
      ref={composeRefs(local, ref)}
      style={{ ...vars, ...style }}
      {...props}
    />
  )
}
