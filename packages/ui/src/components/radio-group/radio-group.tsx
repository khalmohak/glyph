import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'
import { type ComponentProps, createContext, type ReactNode, useContext, useId } from 'react'
import { type SlotClasses, useComponentConfig } from '../../hooks/use-component-config'
import { useFieldControl } from '../field/field-context'
import { type RadioGroupVariants, radioGroupStyles } from './radio-group.styles'

type RootProps = Omit<
  ComponentProps<typeof RadioGroupPrimitive.Root>,
  'value' | 'defaultValue' | 'onValueChange' | 'orientation'
>

export interface RadioGroupProps<T extends string> extends RootProps, RadioGroupVariants {
  value?: T
  defaultValue?: T
  /** Receives your value type, not `string`. */
  onValueChange?: (value: T) => void
}

interface RadioGroupContextValue {
  s: ReturnType<typeof radioGroupStyles>
  slots: SlotClasses<'RadioGroup'>
  variant: NonNullable<RadioGroupVariants['variant']>
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null)

function useRadioGroupContext(): RadioGroupContextValue {
  return useContext(RadioGroupContext) ?? { s: radioGroupStyles(), slots: {}, variant: 'default' }
}

/**
 * Pick exactly one option from a short visible list. `variant="card"` turns each option
 * into a bordered card with a title and description.
 */
export function RadioGroup<T extends string>(inProps: RadioGroupProps<T>) {
  const [props, slots] = useComponentConfig('RadioGroup', useFieldControl(inProps))
  const { variant = 'default', orientation = 'vertical', onValueChange, className, ...rest } = props
  const s = radioGroupStyles({ variant, orientation })
  return (
    <RadioGroupContext.Provider value={{ s, slots, variant }}>
      <RadioGroupPrimitive.Root
        data-slot="radio-group"
        data-variant={variant}
        orientation={orientation}
        {...(onValueChange && { onValueChange: (value: string) => onValueChange(value as T) })}
        className={s.root({ class: [slots.root, className] })}
        {...rest}
      />
    </RadioGroupContext.Provider>
  )
}

export interface RadioGroupItemProps
  extends Omit<ComponentProps<typeof RadioGroupPrimitive.Item>, 'children'> {
  /** Visible label. For card items this is the card title. */
  label?: ReactNode
  description?: ReactNode
  /** Extra content inside a card item, below the description. */
  children?: ReactNode
}

export function RadioGroupItem({
  label,
  description,
  children,
  className,
  id,
  ...props
}: RadioGroupItemProps) {
  const { s, slots, variant } = useRadioGroupContext()
  const generated = useId()
  const itemId = id ?? generated
  const descriptionId = description ? `${itemId}-description` : undefined

  if (variant === 'card') {
    return (
      <RadioGroupPrimitive.Item
        id={itemId}
        data-slot="radio-group-card"
        aria-describedby={descriptionId}
        className={s.card({ class: [slots.card, className] })}
        {...props}
      >
        <span className={s.cardControl({ class: slots.cardControl })} aria-hidden="true">
          <RadioGroupPrimitive.Indicator className={s.indicator({ class: slots.indicator })} />
        </span>
        <span className={s.text({ class: slots.text })}>
          {label && <span className={s.label({ class: slots.label })}>{label}</span>}
          {description && (
            <span id={descriptionId} className={s.description({ class: slots.description })}>
              {description}
            </span>
          )}
          {children}
        </span>
      </RadioGroupPrimitive.Item>
    )
  }

  const control = (
    <RadioGroupPrimitive.Item
      id={itemId}
      data-slot="radio-group-item"
      aria-describedby={descriptionId}
      className={s.control({ class: [slots.control, !label && className] })}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className={s.indicator({ class: slots.indicator })} />
    </RadioGroupPrimitive.Item>
  )
  if (!label) return control

  return (
    <div data-slot="radio-group-option" className={s.option({ class: [slots.option, className] })}>
      {control}
      <span className={s.text({ class: slots.text })}>
        <label htmlFor={itemId} className={s.label({ class: slots.label })}>
          {label}
        </label>
        {description && (
          <span id={descriptionId} className={s.description({ class: slots.description })}>
            {description}
          </span>
        )}
      </span>
    </div>
  )
}
