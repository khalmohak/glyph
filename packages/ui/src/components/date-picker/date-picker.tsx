import { format as formatDate, isSameDay } from 'date-fns'
import { type ReactNode, useRef, useState } from 'react'
import type { DateRange, Matcher } from 'react-day-picker'
import { useComponentConfig } from '../../hooks/use-component-config'
import { useControllableState } from '../../hooks/use-controllable-state'
import { Calendar } from '../calendar/calendar'
import { useFieldControl } from '../field/field-context'
import { Popover, PopoverContent, PopoverTrigger } from '../popover'
import { type DatePickerVariants, datePickerStyles } from './date-picker.styles'

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

function ClearIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

interface SharedProps extends DatePickerVariants {
  placeholder?: ReactNode
  /** date-fns format string for the trigger. Default `"MMM d, yyyy"`. */
  format?: string
  /** Earliest selectable date. */
  minDate?: Date
  /** Latest selectable date. */
  maxDate?: Date
  /** Extra disabled dates, in react-day-picker matcher form. */
  disabledDates?: Matcher | Matcher[]
  /** Show a button that clears the value. */
  clearable?: boolean
  disabled?: boolean
  required?: boolean
  /** Submits the ISO date (yyyy-MM-dd) with a native form. */
  name?: string
  id?: string
  className?: string
  contentClassName?: string
  'aria-label'?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
}

function disabledMatchers({ minDate, maxDate, disabledDates }: SharedProps): Matcher[] {
  const list: Matcher[] = []
  if (minDate) list.push({ before: minDate })
  if (maxDate) list.push({ after: maxDate })
  if (disabledDates) list.push(...(Array.isArray(disabledDates) ? disabledDates : [disabledDates]))
  return list
}

const iso = (date: Date) => formatDate(date, 'yyyy-MM-dd')

export interface DatePickerProps extends SharedProps {
  value?: Date | undefined
  defaultValue?: Date | undefined
  onValueChange?: (date: Date | undefined) => void
}

/** A date field that opens a calendar. Works with Field and with `Form` (`value` + `onValueChange`). */
export function DatePicker(inProps: DatePickerProps) {
  const [props, slots] = useComponentConfig('DatePicker', useFieldControl(inProps))
  const {
    value: valueProp,
    defaultValue,
    onValueChange,
    placeholder = 'Pick a date',
    format = 'MMM d, yyyy',
    clearable = false,
    size,
    disabled,
    name,
    id,
    className,
    contentClassName,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
  } = props
  const [open, setOpen] = useState(false)
  const [value, setValue] = useControllableState<Date | undefined>({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  })
  // Controlled `undefined` means "no date", not "uncontrolled".
  const current = 'value' in inProps ? valueProp : value
  const s = datePickerStyles({ size })
  // Clearing removes the clear button, so focus goes back to the trigger.
  const triggerRef = useRef<HTMLButtonElement>(null)

  return (
    <div className={s.root({ class: [slots.root, className] })}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            ref={triggerRef}
            type="button"
            id={id}
            data-slot="date-picker"
            disabled={disabled}
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedBy}
            aria-invalid={ariaInvalid}
            className={s.trigger({ class: [slots.trigger, clearable && 'pe-9'] })}
          >
            <CalendarIcon className={s.icon({ class: slots.icon })} />
            {current ? (
              <span className={s.value({ class: slots.value })}>{formatDate(current, format)}</span>
            ) : (
              <span className={s.placeholder({ class: slots.placeholder })}>{placeholder}</span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className={s.content({ class: [slots.content, contentClassName] })}
        >
          <Calendar
            mode="single"
            selected={current}
            defaultMonth={current}
            disabled={disabledMatchers(props)}
            onSelect={(date) => {
              setValue(date)
              if (date) setOpen(false)
            }}
            autoFocus
          />
        </PopoverContent>
        {name && <input type="hidden" name={name} value={current ? iso(current) : ''} />}
      </Popover>
      {clearable && current && !disabled && (
        <button
          type="button"
          aria-label="Clear date"
          className={s.clear({ class: slots.clear })}
          onClick={() => {
            setValue(undefined)
            triggerRef.current?.focus()
          }}
        >
          <ClearIcon />
        </button>
      )}
    </div>
  )
}

export interface DateRangePreset {
  label: string
  /** Called when chosen, so relative ranges ("Last 7 days") are computed at that moment. */
  range: () => DateRange
}

export interface DateRangePickerProps extends SharedProps {
  value?: DateRange | undefined
  defaultValue?: DateRange | undefined
  onValueChange?: (range: DateRange | undefined) => void
  /** Quick picks shown beside the calendar. */
  presets?: readonly DateRangePreset[]
  /** Months shown side by side. Default 2. */
  numberOfMonths?: number
}

function formatRange(range: DateRange, format: string): string {
  if (!range.from) return ''
  if (!range.to || isSameDay(range.from, range.to)) return formatDate(range.from, format)
  return `${formatDate(range.from, format)} – ${formatDate(range.to, format)}`
}

/** A date-range field with a two-month calendar and optional presets. */
export function DateRangePicker(inProps: DateRangePickerProps) {
  const [props, slots] = useComponentConfig('DatePicker', useFieldControl(inProps))
  const {
    value: valueProp,
    defaultValue,
    onValueChange,
    presets,
    numberOfMonths = 2,
    placeholder = 'Pick a date range',
    format = 'MMM d, yyyy',
    clearable = false,
    size,
    disabled,
    name,
    id,
    className,
    contentClassName,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
  } = props
  const [open, setOpen] = useState(false)
  const [value, setValue] = useControllableState<DateRange | undefined>({
    value: valueProp,
    defaultValue,
    onChange: onValueChange,
  })
  const current = 'value' in inProps ? valueProp : value
  const s = datePickerStyles({ size })
  // Clearing removes the clear button, so focus goes back to the trigger.
  const triggerRef = useRef<HTMLButtonElement>(null)
  const label = current ? formatRange(current, format) : ''

  return (
    <div className={s.root({ class: [slots.root, className] })}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            ref={triggerRef}
            type="button"
            id={id}
            data-slot="date-range-picker"
            disabled={disabled}
            aria-label={ariaLabel}
            aria-describedby={ariaDescribedBy}
            aria-invalid={ariaInvalid}
            className={s.trigger({ class: [slots.trigger, clearable && 'pe-9'] })}
          >
            <CalendarIcon className={s.icon({ class: slots.icon })} />
            {label ? (
              <span className={s.value({ class: slots.value })}>{label}</span>
            ) : (
              <span className={s.placeholder({ class: slots.placeholder })}>{placeholder}</span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className={s.content({ class: [slots.content, contentClassName] })}
        >
          <div className={s.layout({ class: slots.layout })}>
            {presets && presets.length > 0 && (
              <div className={s.presets({ class: slots.presets })}>
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    className={s.preset({ class: slots.preset })}
                    onClick={() => {
                      setValue(preset.range())
                      setOpen(false)
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            )}
            <Calendar
              mode="range"
              selected={current}
              defaultMonth={current?.from}
              numberOfMonths={numberOfMonths}
              disabled={disabledMatchers(props)}
              onSelect={(range) => setValue(range)}
              autoFocus
            />
          </div>
        </PopoverContent>
        {name && (
          <>
            <input
              type="hidden"
              name={`${name}.from`}
              value={current?.from ? iso(current.from) : ''}
            />
            <input type="hidden" name={`${name}.to`} value={current?.to ? iso(current.to) : ''} />
          </>
        )}
      </Popover>
      {clearable && current?.from && !disabled && (
        <button
          type="button"
          aria-label="Clear dates"
          className={s.clear({ class: slots.clear })}
          onClick={() => {
            setValue(undefined)
            triggerRef.current?.focus()
          }}
        >
          <ClearIcon />
        </button>
      )}
    </div>
  )
}
