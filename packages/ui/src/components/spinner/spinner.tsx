import type { ComponentProps } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { type SpinnerVariants, spinnerStyles } from './spinner.styles'

export interface SpinnerProps extends Omit<ComponentProps<'svg'>, 'children'>, SpinnerVariants {
  /** Accessible label. Omit when the spinner sits inside an element that already says it's busy. */
  label?: string
}

export function Spinner(inProps: SpinnerProps) {
  const [props, slots] = useComponentConfig('Spinner', inProps)
  const { size, label, className, ...rest } = props
  const s = spinnerStyles({ size })
  return (
    <svg
      data-slot="spinner"
      viewBox="0 0 24 24"
      fill="none"
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={s.base({ class: [slots.base, className] })}
      {...rest}
    >
      <circle
        className={s.track({ class: slots.track })}
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className={s.arc({ class: slots.arc })}
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}
