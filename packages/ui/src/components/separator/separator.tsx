import { Separator as SeparatorPrimitive } from 'radix-ui'
import type { ComponentProps } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { tv } from '../../utils/tv'

export const separatorStyles = /* @__PURE__ */ tv({
  slots: { base: 'shrink-0 bg-border' },
  variants: {
    orientation: {
      horizontal: { base: 'h-px w-full' },
      vertical: { base: 'h-full w-px self-stretch' },
    },
  },
  defaultVariants: { orientation: 'horizontal' },
})

export function Separator(inProps: ComponentProps<typeof SeparatorPrimitive.Root>) {
  const [props, slots] = useComponentConfig('Separator', inProps)
  const { orientation = 'horizontal', decorative = true, className, ...rest } = props
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      orientation={orientation}
      decorative={decorative}
      className={separatorStyles({ orientation }).base({ class: [slots.base, className] })}
      {...rest}
    />
  )
}
