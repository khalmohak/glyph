import { m } from 'motion/react'
import { useMotionSettings } from './use-motion-settings'

interface ActiveIndicatorProps {
  /** Shared by every indicator in one group, so the active one slides between items. */
  layoutId: string
  className?: string | undefined
}

/**
 * The highlight behind (or under) the active item of Tabs, SegmentedControl, Sidebar and
 * similar. Rendered only inside the active item; `motion` animates it from the previous one.
 */
export function ActiveIndicator({ layoutId, className }: ActiveIndicatorProps) {
  const { animate } = useMotionSettings()
  if (!animate) return <span aria-hidden="true" data-slot="indicator" className={className} />
  return (
    <m.span
      aria-hidden="true"
      data-slot="indicator"
      layoutId={layoutId}
      initial={false}
      className={className}
    />
  )
}
