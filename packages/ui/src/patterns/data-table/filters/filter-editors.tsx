import type { Column } from '@tanstack/react-table'
import { useId } from 'react'
import { Button } from '../../../components/button'
import { Calendar } from '../../../components/calendar'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '../../../components/command-menu'
import { Input } from '../../../components/input'
import { CheckIcon } from '../../../internal/icons'
import { columnLabel } from '../export'
import type { ColumnFilterConfig, DateRangeFilterValue, RangeFilterValue } from '../types'
import type { filterChipStyles } from './filter-bar'
import { parseDay, toDay, toList } from './filter-fns'

type S = ReturnType<typeof filterChipStyles>

/** Option list for `select` and `multi`: searchable when it is long, with match counts. */
function OptionsEditor<T>({
  column,
  config,
  counts,
  s,
}: {
  column: Column<T, unknown>
  config: Extract<ColumnFilterConfig, { type: 'select' | 'multi' }>
  counts: Map<string, number> | undefined
  s: S
}) {
  const multi = config.type === 'multi'
  const selected = toList(column.getFilterValue())
  const label = columnLabel(column)
  const toggle = (value: string) => {
    if (!multi) {
      column.setFilterValue(selected[0] === value ? undefined : value)
      return
    }
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value]
    column.setFilterValue(next.length ? next : undefined)
  }
  return (
    <Command label={`${label} filter`} className="w-64">
      {config.options.length > 7 && <CommandInput placeholder={`Filter ${label.toLowerCase()}…`} />}
      <CommandList className={s.list()}>
        <CommandEmpty>No matches</CommandEmpty>
        {config.options.map((option) => {
          const on = selected.includes(option.value)
          const count = option.count ?? counts?.get(option.value)
          return (
            <CommandItem
              key={option.value}
              value={`${option.label} ${option.value}`}
              closeOnSelect={false}
              onSelect={() => toggle(option.value)}
              aria-checked={on}
              className={s.option()}
              {...(option.icon !== undefined && { icon: option.icon })}
            >
              <span className="flex w-full items-center gap-2">
                <span className={s.check({ class: on && s.checkOn() })} aria-hidden="true">
                  {on && <CheckIcon />}
                </span>
                <span className="truncate">{option.label}</span>
                {count !== undefined && <span className={s.count()}>{count}</span>}
              </span>
            </CommandItem>
          )
        })}
      </CommandList>
    </Command>
  )
}

function RangeEditor<T>({
  column,
  config,
  s,
}: {
  column: Column<T, unknown>
  config: Extract<ColumnFilterConfig, { type: 'range' }>
  s: S
}) {
  const value = (column.getFilterValue() ?? {}) as RangeFilterValue
  const set = (key: 'min' | 'max', text: string) => {
    const n = text === '' ? undefined : Number(text)
    const next = { ...value, [key]: Number.isFinite(n) ? n : undefined }
    column.setFilterValue(next.min === undefined && next.max === undefined ? undefined : next)
  }
  const id = useId()
  const bounds = {
    ...(config.min !== undefined && { min: config.min }),
    ...(config.max !== undefined && { max: config.max }),
    ...(config.step !== undefined && { step: config.step }),
  }
  return (
    <div className={s.fields()}>
      <label className={s.fieldLabel()} htmlFor={`${id}-min`}>
        Minimum
        <Input
          id={`${id}-min`}
          size="sm"
          type="number"
          inputMode="decimal"
          value={value.min ?? ''}
          onChange={(event) => set('min', event.target.value)}
          {...bounds}
        />
      </label>
      <label className={s.fieldLabel()} htmlFor={`${id}-max`}>
        Maximum
        <Input
          id={`${id}-max`}
          size="sm"
          type="number"
          inputMode="decimal"
          value={value.max ?? ''}
          onChange={(event) => set('max', event.target.value)}
          {...bounds}
        />
      </label>
    </div>
  )
}

function DateRangeEditor<T>({
  column,
  config,
  s,
}: {
  column: Column<T, unknown>
  config: Extract<ColumnFilterConfig, { type: 'date-range' }>
  s: S
}) {
  const value = (column.getFilterValue() ?? {}) as DateRangeFilterValue
  const selected = {
    from: value.from ? parseDay(value.from) : undefined,
    to: value.to ? parseDay(value.to) : undefined,
  }
  const apply = (range: { from?: Date | undefined; to?: Date | undefined } | undefined) => {
    const from = range?.from ? toDay(range.from) : undefined
    const to = range?.to ? toDay(range.to) : undefined
    column.setFilterValue(from || to ? { ...(from && { from }), ...(to && { to }) } : undefined)
  }
  return (
    <div>
      <Calendar
        mode="range"
        selected={selected}
        onSelect={apply}
        numberOfMonths={1}
        {...(selected.from && { defaultMonth: selected.from })}
        className="p-3"
      />
      {config.presets && config.presets.length > 0 && (
        <div className={s.presets()}>
          {config.presets.map((preset) => (
            <Button
              key={preset.label}
              size="sm"
              variant="ghost"
              onClick={() => apply(preset.range())}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}

function TextEditor<T>({
  column,
  config,
  s,
}: {
  column: Column<T, unknown>
  config: Extract<ColumnFilterConfig, { type: 'text' }>
  s: S
}) {
  const label = columnLabel(column)
  const id = useId()
  return (
    <div className="p-3">
      <label className={s.fieldLabel()} htmlFor={id}>
        {label} contains
        <Input
          id={id}
          size="sm"
          autoFocus
          value={String(column.getFilterValue() ?? '')}
          placeholder={config.placeholder ?? 'Type to filter…'}
          onChange={(event) => column.setFilterValue(event.target.value || undefined)}
        />
      </label>
    </div>
  )
}

/** The editor inside a filter chip's popover, by filter type. */
export function FilterEditor<T>({
  column,
  config,
  counts,
  s,
}: {
  column: Column<T, unknown>
  config: ColumnFilterConfig
  counts: Map<string, number> | undefined
  s: S
}) {
  switch (config.type) {
    case 'select':
    case 'multi':
      return <OptionsEditor column={column} config={config} counts={counts} s={s} />
    case 'range':
      return <RangeEditor column={column} config={config} s={s} />
    case 'date-range':
      return <DateRangeEditor column={column} config={config} s={s} />
    case 'text':
      return <TextEditor column={column} config={config} s={s} />
  }
}
