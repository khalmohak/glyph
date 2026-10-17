import { AnimatePresence, m } from 'motion/react'
import type { ComponentProps, ReactNode } from 'react'
import { useMotionSettings } from './use-motion-settings'

/**
 * Animates items of a list in and out, and slides the rest into place. Children must be
 * keyed `PresenceItem`s. Renders the list statically when motion is off.
 */
export function PresenceList({ children }: { children: ReactNode }) {
  const { animate } = useMotionSettings()
  if (!animate) return children
  return <AnimatePresence initial={false}>{children}</AnimatePresence>
}

type PresenceItemProps<T extends 'li' | 'span'> = ComponentProps<T> & { as?: T }

const enter = { opacity: 0, scale: 0.96 }
const shown = { opacity: 1, scale: 1 }
const leave = { opacity: 0, scale: 0.96, transition: { duration: 0.12 } }

/** One item of a `PresenceList`: fades and scales in, out, and between positions. */
export function PresenceItem<T extends 'li' | 'span' = 'li'>({
  as,
  ...props
}: PresenceItemProps<T>) {
  const { animate } = useMotionSettings()
  const tag = (as ?? 'li') as 'li' | 'span'
  if (!animate) {
    const Static = tag
    return <Static {...(props as ComponentProps<'li'>)} />
  }
  const Animated = (tag === 'li' ? m.li : m.span) as typeof m.li
  return (
    <Animated
      layout="position"
      initial={enter}
      animate={shown}
      exit={leave}
      {...(props as ComponentProps<typeof m.li>)}
    />
  )
}
