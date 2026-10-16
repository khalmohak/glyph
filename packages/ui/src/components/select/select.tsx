import { Select as SelectPrimitive } from 'radix-ui'
import type { ComponentProps, ReactNode } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { CheckIcon, ChevronDownIcon } from '../../internal/icons'
import { popover } from '../../utils/styles'
import { tv, type VariantProps } from '../../utils/tv'
import { useFieldControl } from '../field/field-context'
import { fieldControl } from '../input/input.styles'

export const selectStyles = tv({
  slots: {
    trigger: [
      ...fieldControl,
      'flex cursor-pointer items-center justify-between gap-2 px-3 text-left outline-none',
      'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20',
      'data-placeholder:text-faint-foreground disabled:cursor-not-allowed disabled:opacity-50',
      '[&>span]:truncate',
    ],
    icon: 'size-4 shrink-0 text-faint-foreground',
    content: [
      popover,
      'max-h-(--radix-select-content-available-height) min-w-(--radix-select-trigger-width)',
    ],
    viewport: 'p-1',
    item: [
      'relative flex h-8 cursor-pointer select-none items-center gap-2 rounded-sm pr-8 pl-2 text-small outline-none',
      'data-highlighted:bg-muted data-disabled:pointer-events-none data-disabled:opacity-50',
    ],
    indicator: 'absolute right-2 flex items-center text-primary [&>svg]:size-4',
  },
  variants: {
    size: {
      sm: { trigger: 'h-(--glyph-control-sm) text-small' },
      md: { trigger: 'h-(--glyph-control-md) text-small' },
      lg: { trigger: 'h-(--glyph-control-lg) text-body' },
    },
  },
  defaultVariants: { size: 'md' },
})

type RootProps<T extends string> = Omit<
  ComponentProps<typeof SelectPrimitive.Root>,
  'value' | 'defaultValue' | 'onValueChange'
> & {
  value?: T
  defaultValue?: T
  onValueChange?: (value: T) => void
}

export interface SelectProps<T extends string = string>
  extends RootProps<T>,
    VariantProps<typeof selectStyles> {
  placeholder?: ReactNode
  id?: string
  className?: string
  contentClassName?: string
  'aria-label'?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
}

/**
 * A dropdown select. `value` is typed by the `T` you use:
 * `<Select<Plan> value={plan} onValueChange={setPlan}>` only accepts `Plan` values.
 */
export function Select<T extends string = string>(inProps: SelectProps<T>) {
  const [props, slots] = useComponentConfig('Select', useFieldControl(inProps))
  const {
    size,
    placeholder,
    id,
    className,
    contentClassName,
    children,
    onValueChange,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    ...rootProps
  } = props
  const s = selectStyles({ size })
  return (
    <SelectPrimitive.Root
      {...rootProps}
      {...(onValueChange && { onValueChange: (v: string) => onValueChange(v as T) })}
    >
      <SelectPrimitive.Trigger
        id={id}
        data-slot="select-trigger"
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        className={s.trigger({ class: [slots.trigger, className] })}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <ChevronDownIcon className={s.icon({ class: slots.icon })} />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          data-slot="select-content"
          className={s.content({ class: [slots.content, contentClassName] })}
        >
          <SelectPrimitive.Viewport className={s.viewport({ class: slots.viewport })}>
            {children}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}

export interface SelectItemProps extends ComponentProps<typeof SelectPrimitive.Item> {}

export function SelectItem({ className, children, ...props }: SelectItemProps) {
  const [, slots] = useComponentConfig('Select', {})
  const s = selectStyles()
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={s.item({ class: [slots.item, className] })}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className={s.indicator({ class: slots.indicator })}>
        <CheckIcon />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}
