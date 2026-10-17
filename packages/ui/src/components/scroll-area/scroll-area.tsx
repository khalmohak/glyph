import { ScrollArea as ScrollAreaPrimitive } from 'radix-ui'
import { type ComponentProps, useEffect, useRef, useState } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import type { StylesEntry } from '../../utils/registry'
import { focusRing } from '../../utils/styles'
import { tv } from '../../utils/tv'

export const scrollAreaStyles = tv({
  slots: {
    root: 'relative overflow-hidden',
    viewport: ['size-full rounded-[inherit]', focusRing],
    scrollbar: [
      'flex touch-none select-none p-px transition-colors duration-(--glyph-duration-fast)',
      'data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2.5 data-[orientation=vertical]:border-l data-[orientation=vertical]:border-l-transparent',
      'data-[orientation=horizontal]:h-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:border-t data-[orientation=horizontal]:border-t-transparent',
    ],
    thumb: 'relative flex-1 rounded-pill bg-border-strong hover:bg-faint-foreground',
    corner: 'bg-transparent',
  },
})

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    ScrollArea: StylesEntry<typeof scrollAreaStyles>
  }
}

export interface ScrollAreaProps extends ComponentProps<typeof ScrollAreaPrimitive.Root> {
  /** Which scrollbars to show. Default vertical. */
  orientation?: 'vertical' | 'horizontal' | 'both'
  viewportClassName?: string
}

/** True while the element's content overflows it, so keyboard users need to reach it. */
function useOverflowing<E extends HTMLElement>() {
  const ref = useRef<E>(null)
  const [overflowing, setOverflowing] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () =>
      setOverflowing(el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    if (el.firstElementChild) observer.observe(el.firstElementChild)
    return () => observer.disconnect()
  }, [])
  return [ref, overflowing] as const
}

/**
 * A scrollable region with slim, theme-colored scrollbars. Give it a height (or width)
 * with `className`, e.g. `h-72`.
 */
export function ScrollArea(inProps: ScrollAreaProps) {
  const [props, slots] = useComponentConfig('ScrollArea', inProps)
  const { orientation = 'vertical', viewportClassName, className, children, ...rest } = props
  const s = scrollAreaStyles()
  const [viewportRef, overflowing] = useOverflowing<HTMLDivElement>()
  const bar = (o: 'vertical' | 'horizontal') => (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      orientation={o}
      className={s.scrollbar({ class: slots.scrollbar })}
    >
      <ScrollAreaPrimitive.Thumb className={s.thumb({ class: slots.thumb })} />
    </ScrollAreaPrimitive.Scrollbar>
  )
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={s.root({ class: [slots.root, className] })}
      {...rest}
    >
      <ScrollAreaPrimitive.Viewport
        ref={viewportRef}
        data-slot="scroll-area-viewport"
        // Scrollable regions must be reachable by keyboard to scroll with arrow keys.
        tabIndex={overflowing ? 0 : undefined}
        className={s.viewport({ class: [slots.viewport, viewportClassName] })}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      {orientation !== 'horizontal' && bar('vertical')}
      {orientation !== 'vertical' && bar('horizontal')}
      <ScrollAreaPrimitive.Corner className={s.corner({ class: slots.corner })} />
    </ScrollAreaPrimitive.Root>
  )
}
