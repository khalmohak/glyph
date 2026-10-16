import { Label as LabelPrimitive } from 'radix-ui'
import type { ComponentProps } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { tv } from '../../utils/tv'

export const labelStyles = tv({
  slots: {
    base: 'inline-flex select-none items-center gap-1 text-small font-medium text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-60',
  },
})

export function Label(inProps: ComponentProps<typeof LabelPrimitive.Root>) {
  const [{ className, ...rest }, slots] = useComponentConfig('Label', inProps)
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={labelStyles().base({ class: [slots.base, className] })}
      {...rest}
    />
  )
}
