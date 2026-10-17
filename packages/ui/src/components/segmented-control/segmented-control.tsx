import { ToggleGroup } from 'radix-ui'
import { type ReactNode, useContext, useId } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { useControllableState } from '../../hooks/use-controllable-state'
import { warnOnce } from '../../internal/dev'
import { ActiveIndicator } from '../../motion/active-indicator'
import { focusRing, themedBorder, transition } from '../../utils/styles'
import { tv, type VariantProps } from '../../utils/tv'
import { FieldContext } from '../field/field-context'

export const segmentedControlStyles = /* @__PURE__ */ tv({
  slots: {
    root: [
      'isolate inline-flex items-center gap-0.5 rounded-md border-border bg-muted p-0.5',
      themedBorder,
    ],
    item: [
      'relative inline-flex h-full cursor-pointer select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-[calc(var(--radius-md)-2px)] px-3 font-medium text-muted-foreground',
      transition,
      focusRing,
      'hover:text-foreground data-[state=on]:text-foreground',
      'disabled:pointer-events-none disabled:opacity-50 [&>svg]:size-4',
    ],
    /** The raised thumb that slides to the selected option. */
    indicator:
      'pointer-events-none absolute inset-0 -z-10 rounded-[calc(var(--radius-md)-2px)] bg-raised shadow-xs',
  },
  variants: {
    size: {
      sm: { root: 'h-(--glyph-control-sm)', item: 'px-2.5 text-caption' },
      md: { root: 'h-(--glyph-control-md)', item: 'text-small' },
    },
    fullWidth: { true: { root: 'flex w-full', item: 'flex-1' } },
  },
  defaultVariants: { size: 'md' },
})

export interface SegmentedOption<T extends string> {
  value: T
  label: ReactNode
  disabled?: boolean
}

export interface SegmentedControlProps<T extends string>
  extends VariantProps<typeof segmentedControlStyles> {
  options: readonly SegmentedOption<T>[]
  value?: T
  defaultValue?: T
  onValueChange?: (value: T) => void
  /** Required unless the control sits in a `<Field label>`, which labels it. */
  'aria-label'?: string
  'aria-labelledby'?: string
  className?: string
  id?: string
}

/**
 * Pick exactly one of a few options. `T` is inferred from `options`, so `onValueChange`
 * receives your union type, not `string`.
 */
export function SegmentedControl<T extends string>(inProps: SegmentedControlProps<T>) {
  const [props, slots] = useComponentConfig('SegmentedControl', inProps)
  const { options, value, defaultValue, onValueChange, size, fullWidth, className, ...rest } = props
  const field = useContext(FieldContext)
  const s = segmentedControlStyles({ size, fullWidth })
  const [selected, setSelected] = useControllableState<T | undefined>({
    value,
    defaultValue,
    onChange: (next) => next !== undefined && onValueChange?.(next),
  })
  const indicatorId = `${useId()}-segmented-indicator`
  const labelledBy = rest['aria-labelledby'] ?? (rest['aria-label'] ? undefined : field?.labelId)
  if (!rest['aria-label'] && !labelledBy) {
    warnOnce(
      'segmented-control-label',
      'SegmentedControl needs a label: pass aria-label, or place it in a <Field label="…">.',
    )
  }
  const describedBy = [field?.descriptionId, field?.errorId].filter(Boolean).join(' ')
  return (
    <ToggleGroup.Root
      type="single"
      data-slot="segmented-control"
      value={selected ?? ''}
      // Radix emits '' when the active item is clicked again; a segmented control never deselects.
      onValueChange={(next: string) => next && setSelected(next as T)}
      className={s.root({ class: [slots.root, className] })}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy || undefined}
      {...rest}
    >
      {options.map((option) => (
        <ToggleGroup.Item
          key={option.value}
          value={option.value}
          disabled={option.disabled}
          className={s.item({ class: slots.item })}
        >
          {option.label}
          {option.value === selected && (
            <ActiveIndicator
              layoutId={indicatorId}
              className={s.indicator({ class: slots.indicator })}
            />
          )}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  )
}
