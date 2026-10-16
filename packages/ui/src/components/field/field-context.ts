import { createContext, useContext } from 'react'

export interface FieldContextValue {
  id: string
  descriptionId: string | undefined
  errorId: string | undefined
  invalid: boolean
  required: boolean
  disabled: boolean
}

export const FieldContext = createContext<FieldContextValue | null>(null)

interface ControlProps {
  id?: string | undefined
  disabled?: boolean | undefined
  required?: boolean | undefined
  'aria-describedby'?: string | undefined
  'aria-invalid'?: boolean | 'true' | 'false' | 'grammar' | 'spelling' | undefined
}

/**
 * Connects a form control to the surrounding `Field`: id for the label, `aria-describedby`
 * for description and error, `aria-invalid`, `required`, `disabled`. Props passed directly win.
 */
export function useFieldControl<P extends ControlProps>(props: P): P {
  const field = useContext(FieldContext)
  if (!field) return props
  const describedBy = [field.descriptionId, field.errorId, props['aria-describedby']]
    .filter(Boolean)
    .join(' ')
  return {
    ...props,
    id: props.id ?? field.id,
    disabled: props.disabled ?? (field.disabled || undefined),
    required: props.required ?? (field.required || undefined),
    'aria-describedby': describedBy || undefined,
    'aria-invalid': props['aria-invalid'] ?? (field.invalid || undefined),
  }
}
