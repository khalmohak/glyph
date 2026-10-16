import type { ComponentProps, ReactNode } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { stepperStyles } from './stepper.styles'

export type StepStatus = 'complete' | 'current' | 'upcoming' | 'error'

export interface StepperStep {
  title: ReactNode
  description?: ReactNode
  /** Override the status derived from `current`, e.g. `'error'` for a failed step. */
  status?: StepStatus
}

export interface StepperProps extends Omit<ComponentProps<'ol'>, 'children'> {
  steps: readonly StepperStep[]
  /** Index of the current step. Earlier steps are complete, later ones upcoming. */
  current: number
  orientation?: 'horizontal' | 'vertical'
  /** Makes completed steps clickable, e.g. to go back in a wizard. */
  onStepClick?: (index: number) => void
}

const statusText: Record<StepStatus, string> = {
  complete: 'completed',
  current: 'current step',
  upcoming: 'not started',
  error: 'needs attention',
}

const icon = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

const CheckIcon = () => (
  <svg aria-hidden="true" {...icon}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
)
const AlertIcon = () => (
  <svg aria-hidden="true" {...icon}>
    <path d="M12 7v6M12 17h.01" />
  </svg>
)

function statusOf(step: StepperStep, index: number, current: number): StepStatus {
  if (step.status) return step.status
  if (index < current) return 'complete'
  return index === current ? 'current' : 'upcoming'
}

/** Progress through a multi-step flow such as onboarding or checkout. */
export function Stepper(inProps: StepperProps) {
  const [props, slots] = useComponentConfig('Stepper', inProps)
  const {
    steps,
    current,
    orientation = 'horizontal',
    onStepClick,
    className,
    'aria-label': ariaLabel = 'Progress',
    ...rest
  } = props
  const root = stepperStyles({ orientation })

  return (
    <ol
      data-slot="stepper"
      data-orientation={orientation}
      aria-label={ariaLabel}
      className={root.root({ class: [slots.root, className] })}
      {...rest}
    >
      {steps.map((step, index) => {
        const status = statusOf(step, index, current)
        const clickable = Boolean(onStepClick) && status === 'complete'
        const s = stepperStyles({ orientation, status, clickable })
        const content = (
          <>
            <span data-slot="stepper-indicator" className={s.indicator({ class: slots.indicator })}>
              {status === 'complete' ? (
                <CheckIcon />
              ) : status === 'error' ? (
                <AlertIcon />
              ) : (
                index + 1
              )}
            </span>
            <span className={s.text({ class: slots.text })}>
              <span data-slot="stepper-title" className={s.title({ class: slots.title })}>
                {step.title}
              </span>
              {step.description && (
                <span className={s.description({ class: slots.description })}>
                  {step.description}
                </span>
              )}
              <span className="sr-only">, {statusText[status]}</span>
            </span>
          </>
        )
        return (
          <li
            key={index}
            data-slot="stepper-step"
            data-status={status}
            aria-current={status === 'current' ? 'step' : undefined}
            className={s.step({ class: slots.step })}
          >
            {index < steps.length - 1 && (
              <span
                data-slot="stepper-connector"
                aria-hidden="true"
                className={s.connector({ class: slots.connector })}
              />
            )}
            {clickable ? (
              <button
                type="button"
                onClick={() => onStepClick?.(index)}
                className={s.trigger({ class: slots.trigger })}
              >
                {content}
              </button>
            ) : (
              <span className={s.trigger({ class: slots.trigger })}>{content}</span>
            )}
          </li>
        )
      })}
    </ol>
  )
}
