import { Checkbox as CheckboxPrimitive } from 'radix-ui'
import { type ComponentProps, useState } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { CheckIcon, MinusIcon } from '../../internal/icons'
import { focusRing, themedBorder, transition } from '../../utils/styles'
import { tv } from '../../utils/tv'
import { useFieldControl } from '../field/field-context'

export const checkboxStyles = /* @__PURE__ */ tv({
  slots: {
    root: [
      'peer mt-0.5 inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-xs border-input bg-surface text-primary-foreground shadow-xs',
      themedBorder,
      transition,
      focusRing,
      'hover:border-border-strong aria-invalid:border-danger',
      'data-[state=checked]:border-primary data-[state=checked]:bg-primary',
      'data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary',
      'disabled:cursor-not-allowed disabled:opacity-50',
    ],
    indicator: [
      'flex items-center justify-center [&>svg]:size-3.5 [&>svg]:stroke-[3]',
      // Draws the tick when the user checks it (not for boxes already checked on load).
      '[--glyph-draw-length:24] data-[animate]:[&_path]:animate-draw',
    ],
  },
})

export function Checkbox(inProps: ComponentProps<typeof CheckboxPrimitive.Root>) {
  const [{ className, onCheckedChange, ...rest }, slots] = useComponentConfig(
    'Checkbox',
    useFieldControl(inProps),
  )
  const s = checkboxStyles()
  const [changed, setChanged] = useState(false)
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={s.root({ class: [slots.root, className] })}
      onCheckedChange={(checked) => {
        setChanged(true)
        onCheckedChange?.(checked)
      }}
      {...rest}
    >
      <CheckboxPrimitive.Indicator
        data-animate={changed || undefined}
        className={s.indicator({ class: slots.indicator })}
      >
        {rest.checked === 'indeterminate' ? <MinusIcon /> : <CheckIcon />}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}
