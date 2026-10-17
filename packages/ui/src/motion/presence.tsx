import { AnimatePresence } from 'motion/react'
import type { ComponentProps } from 'react'

export type PresenceProps = ComponentProps<typeof AnimatePresence>

/**
 * `motion`'s AnimatePresence with Glyph's defaults: children already on screen when the
 * page loads don't animate in (`initial={false}`). Use it with `m.*` elements for custom
 * enter and exit animations; transitions follow the theme's spring.
 */
export function Presence({ initial = false, ...props }: PresenceProps) {
  return <AnimatePresence initial={initial} {...props} />
}
