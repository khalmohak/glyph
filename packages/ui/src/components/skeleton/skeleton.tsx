import type { ComponentProps } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { tv } from '../../utils/tv'

export const skeletonStyles = tv({
  slots: { base: 'animate-pulse rounded-sm bg-muted' },
})

/** Placeholder block shown while content loads. Size it with classes: `h-4 w-32`. */
export function Skeleton(inProps: ComponentProps<'div'>) {
  const [{ className, ...rest }, slots] = useComponentConfig('Skeleton', inProps)
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={skeletonStyles().base({ class: [slots.base, className] })}
      {...rest}
    />
  )
}
