import { Tooltip as TooltipPrimitive } from 'radix-ui'
import type { ComponentProps, ReactNode } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { tv } from '../../utils/tv'

export const tooltipStyles = tv({
  slots: {
    content:
      'z-50 max-w-xs animate-pop-in rounded-sm bg-secondary px-2 py-1 text-caption text-secondary-foreground shadow-md',
  },
})

export interface TooltipProps
  extends Omit<ComponentProps<typeof TooltipPrimitive.Content>, 'content'> {
  content: ReactNode
  children: ReactNode
  /** Skip the tooltip entirely, e.g. when the label is already visible. */
  disabled?: boolean
  delayDuration?: number
}

/** A short hint on hover or focus. The child must be focusable (a button or link). */
export function Tooltip(inProps: TooltipProps) {
  const [props, slots] = useComponentConfig('Tooltip', inProps)
  const { content, children, disabled, delayDuration, className, sideOffset = 6, ...rest } = props
  if (disabled) return children
  return (
    <TooltipPrimitive.Root {...(delayDuration !== undefined && { delayDuration })}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          data-slot="tooltip"
          sideOffset={sideOffset}
          className={tooltipStyles().content({ class: [slots.content, className] })}
          {...rest}
        >
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}
