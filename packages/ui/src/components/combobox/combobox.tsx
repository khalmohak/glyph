import { Command as Cmdk } from 'cmdk'
import { Popover } from 'radix-ui'
import { type ReactNode, useMemo, useState } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { useControllableState } from '../../hooks/use-controllable-state'
import { CheckIcon, ChevronsUpDownIcon, SearchIcon } from '../../internal/icons'
import { useFieldControl } from '../field/field-context'
import { comboboxStyles } from './combobox.styles'

export interface ComboboxOption<T extends string = string> {
  value: T
  /** Shown in the list and trigger, and matched by search. */
  label: string
  description?: ReactNode
  /** Extra search terms, e.g. abbreviations. */
  keywords?: readonly string[]
  disabled?: boolean
}

interface SingleProps<T extends string> {
  multiple?: false
  value?: T | null
  defaultValue?: T | null
  onValueChange?: (value: T | null) => void
}

interface MultipleProps<T extends string> {
  multiple: true
  value?: readonly T[]
  defaultValue?: readonly T[]
  onValueChange?: (value: T[]) => void
}

interface SharedProps<T extends string> {
  options: readonly ComboboxOption<T>[]
  placeholder?: ReactNode
  searchPlaceholder?: string
  /** Shown when the search matches nothing. */
  emptyText?: ReactNode
  /** Chips shown in the trigger before collapsing to "+N". Multiple mode only. Default 3. */
  maxChips?: number
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  required?: boolean
  /** Submits the value with a native form (comma-free: one hidden input per value). */
  name?: string
  id?: string
  className?: string
  contentClassName?: string
  'aria-label'?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
}

export type ComboboxProps<T extends string = string> = SharedProps<T> &
  (SingleProps<T> | MultipleProps<T>)

function toArray<T>(value: T | readonly T[] | null | undefined): T[] | undefined {
  if (value === undefined) return undefined
  if (value === null) return []
  return Array.isArray(value) ? [...(value as readonly T[])] : [value as T]
}

/**
 * A select with search, for long option lists. `multiple` allows several values, shown
 * as chips. The value type is inferred from `options`.
 */
export function Combobox<T extends string>(inProps: ComboboxProps<T>) {
  const [props, slots] = useComponentConfig('Combobox', useFieldControl(inProps))
  const {
    options,
    multiple = false,
    placeholder = 'Select…',
    searchPlaceholder = 'Search…',
    emptyText = 'No results',
    maxChips = 3,
    size,
    disabled,
    required,
    name,
    id,
    className,
    contentClassName,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
  } = props
  const onValueChange = props.onValueChange as ((value: T | T[] | null) => void) | undefined

  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useControllableState<T[]>({
    value: toArray<T>(props.value),
    defaultValue: toArray<T>(props.defaultValue) ?? [],
    onChange: (next) => onValueChange?.(multiple ? next : (next[0] ?? null)),
  })
  const byValue = useMemo(() => new Map(options.map((o) => [o.value, o])), [options])
  const s = comboboxStyles({ size, multiple })

  const choose = (value: T) => {
    if (multiple) {
      setSelected(
        selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value],
      )
      return
    }
    setSelected(selected[0] === value ? [] : [value])
    setOpen(false)
  }

  const labels = selected.map((v) => byValue.get(v)?.label ?? v)
  let display: ReactNode
  if (labels.length === 0) {
    display = <span className={s.placeholder({ class: slots.placeholder })}>{placeholder}</span>
  } else if (multiple) {
    const shown = labels.slice(0, maxChips)
    display = (
      <>
        {shown.map((label, i) => (
          <span key={selected[i]} className={s.chip({ class: slots.chip })}>
            {label}
          </span>
        ))}
        {labels.length > shown.length && (
          <span className={s.chip({ class: slots.chip })}>+{labels.length - shown.length}</span>
        )}
      </>
    )
  } else {
    display = <span className="truncate">{labels[0]}</span>
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          id={id}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid}
          aria-required={required}
          disabled={disabled}
          data-slot="combobox-trigger"
          className={s.trigger({ class: [slots.trigger, className] })}
        >
          <span className={s.value({ class: slots.value })}>{display}</span>
          <ChevronsUpDownIcon className={s.icon({ class: slots.icon })} />
        </button>
      </Popover.Trigger>
      {name &&
        selected.map((value) => <input key={value} type="hidden" name={name} value={value} />)}
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={4}
          data-slot="combobox-content"
          className={s.content({ class: [slots.content, contentClassName] })}
        >
          <Cmdk loop label={ariaLabel ?? 'Options'}>
            <div className={s.search({ class: slots.search })}>
              <SearchIcon />
              <Cmdk.Input
                placeholder={searchPlaceholder}
                className={s.input({ class: slots.input })}
              />
            </div>
            <Cmdk.List className={s.list({ class: slots.list })}>
              <Cmdk.Empty className={s.empty({ class: slots.empty })}>{emptyText}</Cmdk.Empty>
              {options.map((option) => {
                const checked = selected.includes(option.value)
                return (
                  <Cmdk.Item
                    key={option.value}
                    value={option.value}
                    keywords={[option.label, ...(option.keywords ?? [])]}
                    disabled={option.disabled}
                    onSelect={() => choose(option.value)}
                    data-checked={checked || undefined}
                    aria-checked={checked}
                    className={s.item({ class: slots.item })}
                  >
                    <span className={s.itemText({ class: slots.itemText })}>
                      <span className="truncate">{option.label}</span>
                      {option.description && (
                        <span className={s.itemDescription({ class: slots.itemDescription })}>
                          {option.description}
                        </span>
                      )}
                    </span>
                    {checked && <CheckIcon className={s.check({ class: slots.check })} />}
                  </Cmdk.Item>
                )
              })}
            </Cmdk.List>
          </Cmdk>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
