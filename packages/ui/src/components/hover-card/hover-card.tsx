import { HoverCard as HoverCardPrimitive } from 'radix-ui'
import type { ComponentProps } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import type { StylesEntry } from '../../utils/registry'
import { popover } from '../../utils/styles'
import { tv } from '../../utils/tv'

export const hoverCardStyles = tv({
  slots: {
    content: [popover, 'w-72 max-w-[calc(100vw-2rem)] p-4 text-small outline-none'],
  },
})

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    HoverCard: StylesEntry<typeof hoverCardStyles>
  }
}

/**
 * A rich preview shown while hovering or focusing a link, such as a user or repository card.
 * Sighted mouse users only see it on hover; keep the same information reachable elsewhere.
 */
export const HoverCard = HoverCardPrimitive.Root
export const HoverCardTrigger = HoverCardPrimitive.Trigger

export function HoverCardContent(inProps: ComponentProps<typeof HoverCardPrimitive.Content>) {
  const [props, slots] = useComponentConfig('HoverCard', inProps)
  const { sideOffset = 6, align = 'center', className, ...rest } = props
  return (
    <HoverCardPrimitive.Portal>
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        sideOffset={sideOffset}
        align={align}
        className={hoverCardStyles().content({ class: [slots.content, className] })}
        {...rest}
      />
    </HoverCardPrimitive.Portal>
  )
}
