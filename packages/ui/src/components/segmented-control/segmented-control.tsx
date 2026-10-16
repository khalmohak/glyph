import { ToggleGroup } from 'radix-ui'
import type { ReactNode } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { focusRing, themedBorder, transition } from '../../utils/styles'
import { tv, type VariantProps } from '../../utils/tv'

export const segmentedControlStyles = tv({
  slots: {
    root: [
      'inline-flex items-center gap-0.5 rounded-md border-border bg-muted p-0.5',
      themedBorder,
    ],
    item: [
      'inline-flex h-full cursor-pointer select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-[calc(var(--radius-md)-2px)] px-3 font-medium text-muted-foreground',
      transition,
      focusRing,
      'hover:text-foreground data-[state=on]:bg-raised data-[state=on]:text-foreground data-[state=on]:shadow-xs',
      'disabled:pointer-events-none disabled:opacity-50 [&>svg]:size-4',
    ],
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
  'aria-label': string
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
  const s = segmentedControlStyles({ size, fullWidth })
  return (
    <ToggleGroup.Root
      type="single"
      data-slot="segmented-control"
      {...(value !== undefined && { value })}
      {...(defaultValue !== undefined && { defaultValue })}
      // Radix emits '' when the active item is clicked again; a segmented control never deselects.
      onValueChange={(next: string) => next && onValueChange?.(next as T)}
      className={s.root({ class: [slots.root, className] })}
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
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  )
}
