import type { ComponentProps, ReactNode } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { useFieldControl } from '../field/field-context'
import { type InputVariants, inputStyles } from './input.styles'

export interface InputProps
  extends Omit<ComponentProps<'input'>, 'size' | 'prefix'>,
    InputVariants {
  /** Content before the text, e.g. an icon or `https://`. */
  prefix?: ReactNode
  /** Content after the text, e.g. a unit or a Kbd hint. */
  suffix?: ReactNode
  /** Classes for the `<input>` element itself. `className` styles the outer frame. */
  inputClassName?: string
}

export function Input(inProps: InputProps) {
  const [props, slots] = useComponentConfig('Input', useFieldControl(inProps))
  const { size, prefix, suffix, className, inputClassName, ...rest } = props
  const s = inputStyles({ size })
  const invalid = rest['aria-invalid'] === true || rest['aria-invalid'] === 'true'
  return (
    <div
      data-slot="input"
      data-invalid={invalid || undefined}
      className={s.root({ class: [slots.root, className] })}
    >
      {prefix && <span className={s.adornment({ class: slots.adornment })}>{prefix}</span>}
      <input className={s.input({ class: [slots.input, inputClassName] })} {...rest} />
      {suffix && <span className={s.adornment({ class: slots.adornment })}>{suffix}</span>}
    </div>
  )
}
