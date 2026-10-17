import { type ComponentProps, useRef } from 'react'
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
  // Animate once the key has changed from the first page. Keying the div remounts it, so
  // each later page plays the entrance once; re-renders of the same page never replay it
  // (adding the class to an existing element would).
  const firstKey = useRef(transitionKey)
  const navigated = useRef(false)
  if (transitionKey !== firstKey.current) navigated.current = true
  return (
    <div
      key={transitionKey}
      data-slot="page-transition"
      className={cn(navigated.current && 'animate-page-in', className)}
      {...props}
    />
  )
}
