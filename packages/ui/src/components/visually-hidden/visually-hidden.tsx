import { VisuallyHidden as VisuallyHiddenPrimitive } from 'radix-ui'
import type { ComponentProps } from 'react'

/**
 * Hides content visually while keeping it available to screen readers, e.g. a label for an
 * icon-only control or extra context in a table cell.
 */
export function VisuallyHidden(props: ComponentProps<typeof VisuallyHiddenPrimitive.Root>) {
  return <VisuallyHiddenPrimitive.Root data-slot="visually-hidden" {...props} />
}
