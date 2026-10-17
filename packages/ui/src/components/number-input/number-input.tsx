import {
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { useControllableState } from '../../hooks/use-controllable-state'
import { composeRefs } from '../../utils/compose-refs'
import { useFieldControl } from '../field/field-context'
import { type NumberInputVariants, numberInputStyles } from './number-input.styles'

export interface NumberInputProps
  extends Omit<
      ComponentProps<'input'>,
      'value' | 'defaultValue' | 'onChange' | 'size' | 'type' | 'min' | 'max' | 'step' | 'prefix'
    >,
    NumberInputVariants {
  /** `null` means empty. */
  value?: number | null
  defaultValue?: number | null
  onValueChange?: (value: number | null) => void
  min?: number
  max?: number
  /** Amount added or removed by the steppers and arrow keys. Shift multiplies by 10. Default 1. */
  step?: number
  /** Display formatting when the field isn't focused, e.g. `{ style: 'currency', currency: 'USD' }`. */
  formatOptions?: Intl.NumberFormatOptions
  /** Locale for formatting. Defaults to the browser's. */
  locale?: string
  prefix?: ReactNode
  /** Content after the number, before the steppers, e.g. a unit. */
  suffix?: ReactNode
  /** Hide the − / + buttons. */
  hideSteppers?: boolean
  /** Classes for the `<input>` element. `className` styles the outer frame. */
  inputClassName?: string
}

function clamp(value: number, min?: number, max?: number) {
  return Math.min(max ?? Number.POSITIVE_INFINITY, Math.max(min ?? Number.NEGATIVE_INFINITY, value))
}

/** The decimal separator of a locale: `.` in en-US, `,` in de-DE. */
function decimalSeparator(locale?: string): string {
  const parts = new Intl.NumberFormat(locale).formatToParts(1.5)
  return parts.find((part) => part.type === 'decimal')?.value ?? '.'
}

/**
 * Parses user text leniently: keeps digits, one leading minus and the locale's decimal
 * separator, so grouping, currency symbols and units are ignored ("1.234,5" in de-DE).
 */
function parse(text: string, decimal: string): number | null {
  const escaped = decimal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const cleaned = text
    .replace(new RegExp(`[^\\d${escaped}-]`, 'g'), '')
    .replace(/(?!^)-/g, '')
    .replace(decimal, '.')
  if (cleaned === '' || cleaned === '-' || cleaned === '.') return null
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : null
}

/** Round away float noise from repeated steps (0.1 + 0.2). */
function roundToStep(value: number, step: number) {
  const decimals = (String(step).split('.')[1] ?? '').length
  return Number(value.toFixed(Math.min(decimals + 2, 10)))
}

/**
 * A number field with − / + steppers, arrow-key stepping, min/max clamping on blur, and
 * locale formatting when not focused. The value is a `number`, never a string.
 */
export function NumberInput(inProps: NumberInputProps) {
  const [props, slots] = useComponentConfig('NumberInput', useFieldControl(inProps))
  const {
    value: valueProp,
    defaultValue = null,
    onValueChange,
    min,
    max,
    step = 1,
    formatOptions,
    locale,
    prefix,
    suffix,
    hideSteppers = false,
    size,
    className,
    inputClassName,
    disabled,
    readOnly,
    onBlur,
    onFocus,
    onKeyDown,
    onPointerDown,
    ref,
    ...rest
  } = props
  const [value, setValue] = useControllableState<number | null>({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  })
  // Text being edited. Set while the field has focus, so the raw number shows instead of
  // the formatted one.
  const [draft, setDraft] = useState<string | null>(null)
  const focused = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)
  // Focus swaps the formatted text for the raw number, which moves the caret to the end.
  // A keyboard focus (or a focus that arrived with everything selected) must keep the whole
  // value selected, so typing replaces it instead of appending ($90,000 → $900,001,250).
  const pointerFocus = useRef(false)
  const selectAllOnFocus = useRef(false)
  useLayoutEffect(() => {
    const input = inputRef.current
    if (!selectAllOnFocus.current || !input || document.activeElement !== input) return
    selectAllOnFocus.current = false
    input.setSelectionRange(0, input.value.length)
  })
  const decimal = decimalSeparator(locale)
  const raw = (n: number | null | undefined) =>
    n === null || n === undefined ? '' : String(n).replace('.', decimal)
  const s = numberInputStyles({ size })
  const invalid = rest['aria-invalid'] === true || rest['aria-invalid'] === 'true'

  const display =
    draft ??
    (value === null || value === undefined
      ? ''
      : formatOptions
        ? new Intl.NumberFormat(locale, formatOptions).format(value)
        : String(value))

  /** Applies a value and keeps the field's text in sync: raw while focused, formatted after. */
  const commit = (next: number | null) => {
    const resolved = next === null ? null : roundToStep(clamp(next, min, max), step)
    if (resolved !== (value ?? null)) setValue(resolved)
    setDraft(focused.current ? raw(resolved) : null)
  }

  const stepBy = (direction: 1 | -1, multiplier = 1) => {
    const base = draft !== null ? parse(draft, decimal) : value
    commit((base ?? min ?? 0) + direction * step * multiplier)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented || readOnly) return
    const multiplier = event.shiftKey ? 10 : 1
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      stepBy(1, multiplier)
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      stepBy(-1, multiplier)
    } else if (event.key === 'Home' && min !== undefined) {
      event.preventDefault()
      commit(min)
    } else if (event.key === 'End' && max !== undefined) {
      event.preventDefault()
      commit(max)
    } else if (event.key === 'Enter' && draft !== null) {
      commit(parse(draft, decimal))
    }
  }

  const atMin = value !== null && value !== undefined && min !== undefined && value <= min
  const atMax = value !== null && value !== undefined && max !== undefined && value >= max

  return (
    <div
      data-slot="number-input"
      data-invalid={invalid || undefined}
      className={s.root({ class: [slots.root, className] })}
    >
      {prefix && <span className={s.adornment({ class: slots.adornment })}>{prefix}</span>}
      <input
        type="text"
        inputMode="decimal"
        role="spinbutton"
        aria-valuenow={value ?? undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        autoComplete="off"
        disabled={disabled}
        readOnly={readOnly}
        value={display}
        className={s.input({ class: [slots.input, inputClassName] })}
        ref={composeRefs(inputRef, ref)}
        onPointerDown={(event) => {
          pointerFocus.current = true
          onPointerDown?.(event)
        }}
        onFocus={(event) => {
          const el = event.currentTarget
          const allSelected =
            el.value.length > 0 && el.selectionStart === 0 && el.selectionEnd === el.value.length
          selectAllOnFocus.current = allSelected || !pointerFocus.current
          pointerFocus.current = false
          focused.current = true
          setDraft(raw(value))
          onFocus?.(event)
        }}
        onChange={(event) => {
          const text = event.target.value
          setDraft(text)
          // Report the number while typing, so validation updates before the field blurs.
          // Clamping and step rounding still happen on blur.
          const parsed = parse(text, decimal)
          if (parsed !== (value ?? null)) setValue(parsed)
        }}
        onBlur={(event) => {
          focused.current = false
          if (draft !== null) commit(parse(draft, decimal))
          setDraft(null)
          onBlur?.(event)
        }}
        onKeyDown={handleKeyDown}
        {...rest}
      />
      {suffix && <span className={s.adornment({ class: slots.adornment })}>{suffix}</span>}
      {!hideSteppers && (
        <span className={s.steppers({ class: slots.steppers })}>
          <button
            type="button"
            tabIndex={-1}
            aria-label="Decrease"
            disabled={disabled || readOnly || atMin}
            className={s.stepper({ class: slots.stepper })}
            onClick={() => stepBy(-1)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
            </svg>
          </button>
          <button
            type="button"
            tabIndex={-1}
            aria-label="Increase"
            disabled={disabled || readOnly || atMax}
            className={s.stepper({ class: slots.stepper })}
            onClick={() => stepBy(1)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </span>
      )}
    </div>
  )
}
