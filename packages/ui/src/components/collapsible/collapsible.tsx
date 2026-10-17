import { Collapsible as CollapsiblePrimitive } from 'radix-ui'
import type { ComponentProps } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import type { StylesEntry } from '../../utils/registry'
import { tv } from '../../utils/tv'

export const collapsibleStyles = /* @__PURE__ */ tv({
  slots: {
    root: '',
    trigger: '',
    content:
      'overflow-hidden data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down',
  },
})

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    Collapsible: StylesEntry<typeof collapsibleStyles>
  }
}

const s = collapsibleStyles()

/**
 * Shows and hides one region, e.g. "Show advanced options". For a list of expandable
 * sections use Accordion.
 */
export function Collapsible(inProps: ComponentProps<typeof CollapsiblePrimitive.Root>) {
  const [{ className, ...rest }, slots] = useComponentConfig('Collapsible', inProps)
  return (
    <CollapsiblePrimitive.Root
      data-slot="collapsible"
      className={s.root({ class: [slots.root, className] })}
      {...rest}
    />
  )
}

export function CollapsibleTrigger({
  className,
  ...props
}: ComponentProps<typeof CollapsiblePrimitive.Trigger>) {
  const [, slots] = useComponentConfig('Collapsible', {})
  return (
    <CollapsiblePrimitive.Trigger
      data-slot="collapsible-trigger"
      className={s.trigger({ class: [slots.trigger, className] })}
      {...props}
    />
  )
}

/** Animates its height open and closed; stays mounted until the closing animation ends. */
export function CollapsibleContent({
  className,
  ...props
}: ComponentProps<typeof CollapsiblePrimitive.Content>) {
  const [, slots] = useComponentConfig('Collapsible', {})
  return (
    <CollapsiblePrimitive.Content
      data-slot="collapsible-content"
      className={s.content({ class: [slots.content, className] })}
      {...props}
    />
  )
}
