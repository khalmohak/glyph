import { springEasing, springPosition } from '@glyphui/tokens'
import { type ComponentProps, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { cn } from '../utils/cn'
import { useMotionSettings } from './use-motion-settings'

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

export interface AnimatedNumberProps extends Omit<ComponentProps<'span'>, 'children'> {
  value: number
  /** Intl number formatting, e.g. `{ style: 'currency', currency: 'USD' }`. */
  format?: Intl.NumberFormatOptions
  locale?: string
  /** Full control over the text, e.g. your own price formatter. Overrides `format`. */
  formatValue?: (value: number) => string
  /**
   * Where the first count starts. Defaults to 0, counting up once the number scrolls into
   * view. Set it to `value` to skip the first count.
   */
  from?: number
}

/**
 * A number that springs to each new value: stats, prices, counters. Screen readers get the
 * final value once, not every frame. Shows the final value immediately when motion is off.
 */
export function AnimatedNumber({
  value,
  format,
  locale,
  formatValue,
  from = 0,
  className,
  ref,
  ...props
}: AnimatedNumberProps) {
  const { animate, spring } = useMotionSettings()
  const formatter = useMemo(() => new Intl.NumberFormat(locale, format), [locale, format])
  const text = (n: number) => (formatValue ? formatValue(n) : formatter.format(n))
  // Render the real value first: server HTML, tests and no-JS visitors see the right number.
  const [shown, setShown] = useState(value)
  const current = useRef(value)
  const el = useRef<HTMLSpanElement>(null)
  const [armed, setArmed] = useState(false)
  const [inView, setInView] = useState(false)

  // Before the first paint, rewind to `from` and wait until the number is on screen.
  useIsomorphicLayoutEffect(() => {
    const node = el.current
    if (!node || !animate || typeof IntersectionObserver === 'undefined') return
    current.current = from
    setShown(from)
    setArmed(true)
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setInView(true)
        observer.disconnect()
      }
    })
    observer.observe(node)
    return () => observer.disconnect()
    // Only on mount and when motion turns on: later changes to `from` don't restart it.
  }, [animate])

  useEffect(() => {
    if (!animate || !armed) {
      current.current = value
      setShown(value)
      return
    }
    if (!inView) return
    const start = current.current
    if (start === value) return
    // Nothing to tween to or from (NaN, Infinity): show the value as it is.
    if (!Number.isFinite(start) || !Number.isFinite(value)) {
      current.current = value
      setShown(value)
      return
    }
    const { duration } = springEasing(spring)
    const begin = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const elapsed = Math.min(now - begin, duration)
      const next = start + (value - start) * springPosition(spring, elapsed / 1000)
      current.current = next
      setShown(next)
      if (elapsed < duration) frame = requestAnimationFrame(tick)
      else {
        current.current = value
        setShown(value)
      }
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, animate, armed, inView, spring])

  return (
    <span
      data-slot="animated-number"
      ref={(node) => {
        el.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      }}
      className={cn('tabular-nums', className)}
      {...props}
    >
      {Object.is(shown, value) || !Number.isFinite(value) ? (
        text(value)
      ) : (
        // While counting, screen readers get the final value once, not every frame.
        <>
          <span aria-hidden="true">{text(shown)}</span>
          <span className="sr-only">{text(value)}</span>
        </>
      )}
    </span>
  )
}
