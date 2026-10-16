import { Progress as ProgressPrimitive } from 'radix-ui'
import { type ComponentProps, type ReactNode, useId } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import {
  type ProgressCircleVariants,
  type ProgressVariants,
  progressCircleStyles,
  progressStyles,
} from './progress.styles'

function clampPercent(value: number, max: number): number {
  if (max <= 0) return 0
  return Math.min(100, Math.max(0, (value / max) * 100))
}

const defaultFormat = (value: number, max: number) => `${Math.round(clampPercent(value, max))}%`

export interface ProgressProps extends Omit<ComponentProps<'div'>, 'children'>, ProgressVariants {
  /** Current value. `null` or omitted shows an indeterminate bar. */
  value?: number | null
  max?: number
  /** Visible label above the bar; also its accessible name. */
  label?: ReactNode
  /** Show the value next to the label. */
  showValue?: boolean
  formatValue?: (value: number, max: number) => string
  /** Accessible name when there is no visible label. */
  'aria-label'?: string
}

/** A horizontal bar showing how far a task has progressed. */
export function Progress(inProps: ProgressProps) {
  const [props, slots] = useComponentConfig('Progress', inProps)
  const {
    value = null,
    max = 100,
    label,
    showValue = false,
    formatValue = defaultFormat,
    size,
    tone,
    className,
    'aria-label': ariaLabel,
    ...rest
  } = props
  const labelId = useId()
  const s = progressStyles({ size, tone })
  const determinate = typeof value === 'number'
  const percent = determinate ? clampPercent(value, max) : 0
  const valueText = determinate ? formatValue(value, max) : undefined

  return (
    <div data-slot="progress" className={s.root({ class: [slots.root, className] })} {...rest}>
      {(label || (showValue && valueText)) && (
        <div data-slot="progress-header" className={s.header({ class: slots.header })}>
          {label && (
            <span id={labelId} className={s.label({ class: slots.label })}>
              {label}
            </span>
          )}
          {showValue && valueText && (
            <span className={s.value({ class: slots.value })} aria-hidden="true">
              {valueText}
            </span>
          )}
        </div>
      )}
      <ProgressPrimitive.Root
        data-slot="progress-track"
        value={determinate ? Math.min(Math.max(value, 0), max) : null}
        max={max}
        getValueLabel={(v, m) => formatValue(v, m)}
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : ariaLabel}
        className={s.track({ class: slots.track })}
      >
        <ProgressPrimitive.Indicator
          data-slot="progress-indicator"
          className={s.indicator({ class: slots.indicator })}
          style={determinate ? { transform: `translateX(-${100 - percent}%)` } : undefined}
        />
      </ProgressPrimitive.Root>
    </div>
  )
}

export interface ProgressCircleProps
  extends Omit<ComponentProps<'div'>, 'children'>,
    ProgressCircleVariants {
  value: number
  max?: number
  /** Show the percentage in the center (md and lg sizes). */
  showValue?: boolean
  formatValue?: (value: number, max: number) => string
  /** Accessible name, e.g. "Storage used". */
  'aria-label'?: string
}

const RADIUS = 16
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/** A compact ring for progress or a share of a total. */
export function ProgressCircle(inProps: ProgressCircleProps) {
  const [props, slots] = useComponentConfig('ProgressCircle', inProps)
  const {
    value,
    max = 100,
    showValue = false,
    formatValue = defaultFormat,
    size,
    tone,
    className,
    ...rest
  } = props
  const s = progressCircleStyles({ size, tone })
  const percent = clampPercent(value, max)
  const valueText = formatValue(value, max)

  return (
    <div
      data-slot="progress-circle"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(Math.max(value, 0), max)}
      aria-valuetext={valueText}
      className={s.root({ class: [slots.root, className] })}
      {...rest}
    >
      <svg viewBox="0 0 40 40" className={s.svg({ class: slots.svg })} aria-hidden="true">
        <circle
          cx="20"
          cy="20"
          r={RADIUS}
          fill="none"
          strokeWidth="4"
          className={s.track({ class: slots.track })}
        />
        <circle
          cx="20"
          cy="20"
          r={RADIUS}
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - percent / 100)}
          className={s.indicator({ class: slots.indicator })}
        />
      </svg>
      {showValue && (
        <span className={s.value({ class: slots.value })} aria-hidden="true">
          {valueText}
        </span>
      )}
    </div>
  )
}
