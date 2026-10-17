import { Slider as SliderPrimitive } from 'radix-ui'
import { type ReactNode, useContext } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { FieldContext, useFieldControl } from '../field/field-context'
import { sliderStyles } from './slider.styles'

export type SliderValue = number | readonly [number, number]

export interface SliderMark {
  value: number
  label?: ReactNode
}

export interface SliderProps<V extends SliderValue> {
  /** A number for one thumb, a `[min, max]` tuple for a range. */
  value?: V
  defaultValue?: V
  onValueChange?: (value: V) => void
  /** Fires once when the user releases the thumb. Use it for expensive updates. */
  onValueCommit?: (value: V) => void
  min?: number
  max?: number
  step?: number
  /** Minimum distance between range thumbs, in steps. */
  minStepsBetweenThumbs?: number
  /** Labels shown under the track at given values. */
  marks?: readonly (number | SliderMark)[]
  /** Show the current value above each thumb. Pass a function to format it. */
  showValue?: boolean | ((value: number) => ReactNode)
  disabled?: boolean
  name?: string
  id?: string
  className?: string
  /** Accessible name. Inside a `Field`, the field's label is used when this is not set. */
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
  /** Accessible names for range thumbs. Default: "Minimum", "Maximum". */
  thumbLabels?: readonly [string, string]
}

const toArray = (value: SliderValue | undefined): number[] | undefined =>
  value === undefined ? undefined : typeof value === 'number' ? [value] : [...value]

/** Choose a number, or a range with two thumbs, by dragging or with arrow keys. */
export function Slider<V extends SliderValue = number>(inProps: SliderProps<V>) {
  const [props, slots] = useComponentConfig('Slider', useFieldControl(inProps))
  const {
    value,
    defaultValue,
    onValueChange,
    onValueCommit,
    min = 0,
    max = 100,
    step = 1,
    minStepsBetweenThumbs,
    marks,
    showValue = false,
    disabled,
    name,
    id,
    className,
    thumbLabels = ['Minimum', 'Maximum'],
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
  } = props
  const field = useContext(FieldContext)
  // Thumbs are not labelable elements, so a Field's <label for> can't name them.
  const labelledBy = ariaLabelledBy ?? (ariaLabel ? undefined : field?.labelId)
  const isRange = Array.isArray(value ?? defaultValue)
  const fromArray = (next: number[]) => (isRange ? [next[0], next[1]] : next[0]) as V
  const current = toArray(value) ?? toArray(defaultValue) ?? [min]
  const s = sliderStyles({ showValue: Boolean(showValue) })
  const format = typeof showValue === 'function' ? showValue : (n: number) => n

  return (
    <div data-slot="slider" className={s.wrapper({ class: [slots.wrapper, className] })}>
      <SliderPrimitive.Root
        className={s.root({ class: slots.root })}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        name={name}
        {...(minStepsBetweenThumbs !== undefined && { minStepsBetweenThumbs })}
        {...(value !== undefined && { value: toArray(value) })}
        {...(defaultValue !== undefined && { defaultValue: toArray(defaultValue) })}
        {...(onValueChange && {
          onValueChange: (next: number[]) => onValueChange(fromArray(next)),
        })}
        {...(onValueCommit && {
          onValueCommit: (next: number[]) => onValueCommit(fromArray(next)),
        })}
      >
        <SliderPrimitive.Track className={s.track({ class: slots.track })}>
          <SliderPrimitive.Range className={s.range({ class: slots.range })} />
        </SliderPrimitive.Track>
        {current.map((thumbValue, index) => (
          <SliderPrimitive.Thumb
            key={index}
            id={index === 0 ? id : undefined}
            aria-label={isRange ? thumbLabels[index] : ariaLabel}
            aria-labelledby={isRange ? undefined : labelledBy}
            aria-describedby={ariaDescribedBy}
            aria-invalid={ariaInvalid}
            className={s.thumb({ class: slots.thumb })}
          >
            {showValue && (
              <span className={s.value({ class: slots.value })} aria-hidden="true">
                {format(thumbValue)}
              </span>
            )}
          </SliderPrimitive.Thumb>
        ))}
      </SliderPrimitive.Root>
      {marks && marks.length > 0 && (
        <div className={s.marks({ class: slots.marks })} aria-hidden="true">
          {marks.map((mark) => {
            const m = typeof mark === 'number' ? { value: mark } : mark
            const percent = ((m.value - min) / (max - min || 1)) * 100
            return (
              <span
                key={m.value}
                className={s.mark({ class: slots.mark })}
                style={{ left: `${percent}%` }}
              >
                {m.label ?? m.value}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
