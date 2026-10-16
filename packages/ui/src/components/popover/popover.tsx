import { Popover as PopoverPrimitive } from 'radix-ui'
import type { ComponentProps } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import type { StylesEntry } from '../../utils/registry'
import { popover } from '../../utils/styles'
import { tv } from '../../utils/tv'

export const popoverStyles = tv({
  slots: {
    content: [
      popover,
      'w-72 max-w-[calc(100vw-2rem)] overflow-visible p-4 text-small outline-none',
    ],
    arrow: 'fill-raised',
  },
})

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    Popover: StylesEntry<typeof popoverStyles>
  }
}

/** Floating content anchored to a trigger: quick settings, details, small forms. */
export const Popover = PopoverPrimitive.Root
export const PopoverTrigger = PopoverPrimitive.Trigger
export const PopoverAnchor = PopoverPrimitive.Anchor
export const PopoverClose = PopoverPrimitive.Close

export interface PopoverContentProps extends ComponentProps<typeof PopoverPrimitive.Content> {
  /** Render a small arrow pointing at the trigger. */
  showArrow?: boolean
}

export function PopoverContent(inProps: PopoverContentProps) {
  const [props, slots] = useComponentConfig('Popover', inProps)
  const {
    showArrow = false,
    sideOffset = 6,
    align = 'center',
    className,
    children,
    ...rest
  } = props
  const s = popoverStyles()
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        sideOffset={sideOffset}
        align={align}
        className={s.content({ class: [slots.content, className] })}
        {...rest}
      >
        {children}
        {showArrow && (
          <PopoverPrimitive.Arrow
            width={12}
            height={6}
            className={s.arrow({ class: slots.arrow })}
          />
        )}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
}
