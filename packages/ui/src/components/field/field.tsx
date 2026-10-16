import { type ComponentProps, type ReactNode, useId, useMemo } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { Label } from '../label'
import { type FieldVariants, fieldStyles } from './field.styles'
import { FieldContext } from './field-context'

export interface FieldProps extends Omit<ComponentProps<'div'>, 'children'>, FieldVariants {
  label?: ReactNode
  description?: ReactNode
  /** Error message. Marks the control invalid and is announced to screen readers. */
  error?: ReactNode
  required?: boolean
  disabled?: boolean
  /** Id for the control. Generated when omitted. */
  controlId?: string
  children: ReactNode
}

/**
 * Wraps one form control with its label, description and error, and wires the ARIA
 * attributes between them. Controls inside (Input, Select, Checkbox, ...) pick this up.
 *
 * `orientation="horizontal"` puts the control first with text beside it, for checkboxes
 * and switches.
 */
export function Field(inProps: FieldProps) {
  const [props, slots] = useComponentConfig('Field', inProps)
  const {
    label,
    description,
    error,
    required = false,
    disabled = false,
    controlId,
    orientation,
    className,
    children,
    ...rest
  } = props
  const generated = useId()
  const id = controlId ?? generated
  const invalid = Boolean(error)
  const descriptionId = description ? `${id}-description` : undefined
  const errorId = invalid ? `${id}-error` : undefined
  const s = fieldStyles({ orientation })

  const context = useMemo(
    () => ({ id, descriptionId, errorId, invalid, required, disabled }),
    [id, descriptionId, errorId, invalid, required, disabled],
  )

  const labelNode = label ? (
    <Label htmlFor={id} className={s.label({ class: slots.label })}>
      {label}
      {required && (
        <span className={s.required({ class: slots.required })} aria-hidden="true">
          *
        </span>
      )}
    </Label>
  ) : null

  const messages = (
    <>
      {description && (
        <p
          id={descriptionId}
          data-slot="field-description"
          className={s.description({ class: slots.description })}
        >
          {description}
        </p>
      )}
      {invalid && (
        <p id={errorId} data-slot="field-error" className={s.error({ class: slots.error })}>
          {error}
        </p>
      )}
    </>
  )

  return (
    <FieldContext.Provider value={context}>
      <div
        data-slot="field"
        data-invalid={invalid || undefined}
        data-disabled={disabled || undefined}
        className={s.root({ class: [slots.root, className] })}
        {...rest}
      >
        {orientation === 'horizontal' ? (
          <>
            {children}
            <div data-slot="field-text" className={s.text({ class: slots.text })}>
              {labelNode}
              {messages}
            </div>
          </>
        ) : (
          <>
            {labelNode}
            {children}
            {messages}
          </>
        )}
      </div>
    </FieldContext.Provider>
  )
}
