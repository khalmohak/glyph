import type { ComponentProps } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { tv } from '../../utils/tv'
import { useFieldControl } from '../field/field-context'
import { fieldControl } from '../input/input.styles'

export const textareaStyles = /* @__PURE__ */ tv({
  slots: {
    base: [
      ...fieldControl,
      'field-sizing-content min-h-20 resize-y rounded-[min(var(--radius-md),var(--radius-lg))] px-3 py-2 text-small',
      'outline-none placeholder:text-faint-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20',
      'disabled:cursor-not-allowed disabled:opacity-50',
    ],
  },
})

export function Textarea(inProps: ComponentProps<'textarea'>) {
  const [{ className, ...rest }, slots] = useComponentConfig('Textarea', useFieldControl(inProps))
  return (
    <textarea
      data-slot="textarea"
      className={textareaStyles().base({ class: [slots.base, className] })}
      {...rest}
    />
  )
}
