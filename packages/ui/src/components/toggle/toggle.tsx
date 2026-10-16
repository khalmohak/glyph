import { ToggleGroup as ToggleGroupPrimitive, Toggle as TogglePrimitive } from 'radix-ui'
import { type ComponentProps, createContext, useContext } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { type ToggleVariants, toggleStyles } from './toggle.styles'

export interface ToggleProps extends ComponentProps<typeof TogglePrimitive.Root>, ToggleVariants {}

/**
 * A two-state button, e.g. Bold in a toolbar. Use Switch for settings that take effect
 * immediately, and Checkbox inside forms.
 */
export function Toggle(inProps: ToggleProps) {
  const [props, slots] = useComponentConfig('Toggle', inProps)
  const { variant, size, className, ...rest } = props
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={toggleStyles({ variant, size }).base({ class: [slots.base, className] })}
      {...rest}
    />
  )
}

const ToggleGroupContext = createContext<ToggleVariants>({})

export type ToggleGroupProps = ComponentProps<typeof ToggleGroupPrimitive.Root> & ToggleVariants

/**
 * A set of toggles. `type="single"` behaves like a radio group (text alignment),
 * `type="multiple"` like checkboxes (bold, italic, underline). Arrow keys move between items.
 */
export function ToggleGroup(inProps: ToggleGroupProps) {
  const [props, slots] = useComponentConfig('Toggle', inProps)
  const { variant, size, className, ...rest } = props
  return (
    <ToggleGroupContext.Provider value={{ variant, size }}>
      <ToggleGroupPrimitive.Root
        data-slot="toggle-group"
        className={toggleStyles().group({ class: [slots.group, className] })}
        {...rest}
      />
    </ToggleGroupContext.Provider>
  )
}

export interface ToggleGroupItemProps
  extends ComponentProps<typeof ToggleGroupPrimitive.Item>,
    ToggleVariants {}

export function ToggleGroupItem({ variant, size, className, ...props }: ToggleGroupItemProps) {
  const group = useContext(ToggleGroupContext)
  const [, slots] = useComponentConfig('Toggle', {})
  const s = toggleStyles({ variant: variant ?? group.variant, size: size ?? group.size })
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={s.base({ class: [slots.base, className] })}
      {...props}
    />
  )
}
