import { Slot } from 'radix-ui'
import {
  Children,
  type ComponentProps,
  type CSSProperties,
  isValidElement,
  type ReactNode,
  useLayoutEffect,
  useRef,
} from 'react'
import { composeRefs } from '../utils/compose-refs'
import { type RevealOptions, useReveal } from './use-reveal'

type StaggerElement = 'div' | 'ul' | 'ol' | 'dl' | 'section'

export interface StaggerProps extends ComponentProps<'div'>, RevealOptions {
  /** The element to render, e.g. `ul` for a list whose `li` items cascade in. Default `div`. */
  as?: StaggerElement
  /** Milliseconds between one child and the next. Defaults to the motion level's step. */
  step?: number
  /** Milliseconds before the first child. */
  delay?: number
  asChild?: boolean
}

/**
 * Reveals its children one after another when the group scrolls into view: feature grids,
 * pricing tiers, card lists. Each direct child becomes a `StaggerItem` without a wrapper.
 */
export function Stagger({
  step,
  delay,
  once,
  amount,
  enabled,
  as = 'div',
  asChild,
  style,
  children,
  ref,
  ...props
}: StaggerProps) {
  const local = useRef<HTMLDivElement>(null)
  useReveal(local, 'stagger', { once, amount, enabled })
  const Comp = (asChild ? Slot.Root : as) as 'div'
  const vars = {
    ...(step !== undefined && { '--glyph-stagger-step': `${step}ms` }),
    ...(delay !== undefined && { '--glyph-stagger-delay': `${delay}ms` }),
  } as CSSProperties
  let index = 0
  const items = Children.map(children, (child) =>
    isValidElement(child) ? <StaggerItem index={index++}>{child}</StaggerItem> : child,
  )
  return (
    <Comp
      data-slot="stagger"
      ref={composeRefs(local, ref)}
      style={{ ...vars, ...style }}
      {...props}
    >
      {asChild ? children : items}
    </Comp>
  )
}

export interface StaggerItemProps {
  /**
   * Position in the cascade, starting at 0. Leave it out to follow document order among the
   * items of the surrounding `Stagger`.
   */
  index?: number
  children: ReactNode
}

/**
 * One step of a `Stagger`, for children that are not direct (e.g. inside a fragment or a
 * mapped list with wrappers). Merges onto its child; renders no element of its own.
 */
export function StaggerItem({ index, children }: StaggerItemProps) {
  const ref = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    const element = ref.current
    if (index !== undefined || !element) return
    const root = element.closest('[data-slot="stagger"]')
    if (!root) return
    // Count items at this nesting level only: a wrapping item (a direct child the Stagger
    // already ordered) starts its own sequence.
    const level = (item: Element) => item.parentElement?.closest('[data-stagger-item]') ?? null
    const own = level(element)
    const peers = Array.from(root.querySelectorAll('[data-stagger-item]')).filter(
      (item) => level(item) === own,
    )
    const position = peers.indexOf(element)
    if (position >= 0) element.style.setProperty('--glyph-stagger-index', String(position))
  })
  return (
    <Slot.Root
      ref={ref}
      data-stagger-item=""
      {...(index !== undefined && {
        style: { '--glyph-stagger-index': index } as CSSProperties,
      })}
    >
      {children}
    </Slot.Root>
  )
}
