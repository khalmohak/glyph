import { Switch as SwitchPrimitive } from 'radix-ui'
import type { ComponentProps } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { focusRing, themedBorder, transition } from '../../utils/styles'
import { tv, type VariantProps } from '../../utils/tv'
import { useFieldControl } from '../field/field-context'

export const switchStyles = tv({
  slots: {
    root: [
      'peer inline-flex shrink-0 cursor-pointer items-center rounded-pill border-transparent bg-input p-px',
      themedBorder,
      transition,
      focusRing,
      'data-[state=checked]:bg-primary disabled:cursor-not-allowed disabled:opacity-50',
    ],
    thumb:
      'pointer-events-none block rounded-pill bg-white shadow-sm transition-transform duration-(--glyph-duration-base) ease-emphasized data-[state=unchecked]:translate-x-0',
  },
  variants: {
    size: {
      sm: { root: 'h-4 w-7', thumb: 'size-3 data-[state=checked]:translate-x-3' },
      md: { root: 'h-5 w-9', thumb: 'size-4 data-[state=checked]:translate-x-4' },
    },
  },
  defaultVariants: { size: 'md' },
})

export interface SwitchProps
  extends ComponentProps<typeof SwitchPrimitive.Root>,
    VariantProps<typeof switchStyles> {}

export function Switch(inProps: SwitchProps) {
  const [{ size, className, ...rest }, slots] = useComponentConfig(
    'Switch',
    useFieldControl(inProps),
  )
  const s = switchStyles({ size })
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={s.root({ class: [slots.root, className] })}
      {...rest}
    >
      <SwitchPrimitive.Thumb className={s.thumb({ class: slots.thumb })} />
    </SwitchPrimitive.Root>
  )
}
