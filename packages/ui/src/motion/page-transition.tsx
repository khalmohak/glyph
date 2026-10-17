import { type ComponentProps, useEffect, useRef } from 'react'
import { cn } from '../utils/cn'

export interface PageTransitionProps extends ComponentProps<'div'> {
  /**
   * Changes when the page changes, e.g. `location.pathname`. Each new value replays the
   * entrance; the first page renders without one.
   */
  transitionKey: string
}

/**
 * Fades and lifts each new page in on route changes. Wrap your router outlet:
 * `<PageTransition transitionKey={useLocation().pathname}><Outlet /></PageTransition>`.
 * Enter-only by design: the old page leaves immediately, so nothing ever overlaps or flickers.
 */
export function PageTransition({ transitionKey, className, ...props }: PageTransitionProps) {
  const mounted = useRef(false)
  useEffect(() => {
    mounted.current = true
  }, [])
  return (
    <div
      key={transitionKey}
      data-slot="page-transition"
      className={cn(mounted.current && 'animate-page-in', className)}
      {...props}
    />
  )
}
