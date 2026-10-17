import type { Column, Table } from '@tanstack/react-table'
import { lazy, Suspense, useRef, useState } from 'react'
import { Button } from '../../../components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/popover'
import { Spinner } from '../../../components/spinner'
import { XIcon } from '../../../internal/icons'
import { focusRing, themedBorder } from '../../../utils/styles'
import { tv } from '../../../utils/tv'
import { columnLabel } from '../export'
import { FilterIcon } from '../icons'
import type {
  ColumnFilterConfig,
  DateRangeFilterValue,
  FilterOption,
  RangeFilterValue,
} from '../types'
import { countValues, isActiveFilter, parseDay, toList } from './filter-fns'

export const filterChipStyles = /* @__PURE__ */ tv({
  slots: {
    chip: [
      'inline-flex h-(--glyph-control-sm) max-w-full items-stretch overflow-hidden rounded-md border-border bg-surface text-small shadow-xs',
      themedBorder,
    ],
    part: 'flex items-center gap-1.5 whitespace-nowrap px-2 text-muted-foreground [&>svg]:size-3.5',
    operator: 'flex items-center border-l border-border px-2 text-faint-foreground',
    value: [
      'flex min-w-0 cursor-pointer items-center border-l border-border px-2 font-medium text-foreground hover:bg-muted data-[state=open]:bg-muted',
      focusRing,
      'focus-visible:ring-offset-0 focus-visible:ring-inset',
    ],
    valueText: 'truncate',
    remove: [
      'flex w-7 cursor-pointer items-center justify-center border-l border-border text-muted-foreground hover:bg-muted hover:text-foreground [&>svg]:size-3.5',
      focusRing,
      'focus-visible:ring-offset-0 focus-visible:ring-inset',
    ],
    editor: 'w-auto min-w-60 p-0',
    list: 'max-h-72 p-1',
    option: 'gap-2',
    check: [
      'flex size-4 shrink-0 items-center justify-center rounded-xs border-border text-primary-foreground [&>svg]:size-3',
      themedBorder,
    ],
    checkOn: 'border-primary bg-primary',
    count: 'ml-auto pl-3 font-mono text-caption text-faint-foreground tabular-nums',
    fields: 'grid grid-cols-2 gap-2 p-3',
    fieldLabel: 'grid gap-1 text-caption text-muted-foreground',
    presets: 'flex flex-wrap gap-1 border-t border-border p-2',
  },
})

const operators: Record<ColumnFilterConfig['type'], string> = {
  select: 'is',
  multi: 'is any of',
  range: 'between',
  'date-range': 'between',
  text: 'contains',
}

const dayFormat = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' })
const dayYearFormat = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

function optionLabel(options: readonly FilterOption[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value
}

/** The short text a chip shows for its value. */
export function filterSummary(config: ColumnFilterConfig, value: unknown): string {
  switch (config.type) {
    case 'select':
      return optionLabel(config.options, String(value))
    case 'multi': {
      const values = toList(value)
      if (values.length <= 2) return values.map((v) => optionLabel(config.options, v)).join(', ')
      return `${values.length} selected`
    }
    case 'range': {
      const { min, max } = (value ?? {}) as RangeFilterValue
      const f = config.format ?? ((n: number) => n.toLocaleString())
      if (min !== undefined && max !== undefined) return `${f(min)} – ${f(max)}`
      if (min !== undefined) return `≥ ${f(min)}`
      if (max !== undefined) return `≤ ${f(max)}`
      return ''
    }
    case 'date-range': {
      const { from, to } = (value ?? {}) as DateRangeFilterValue
      const sameYear = from && to && from.slice(0, 4) === to.slice(0, 4)
      const show = (day: string, withYear: boolean) =>
        (withYear ? dayYearFormat : dayFormat).format(parseDay(day))
      if (from && to) return `${show(from, !sameYear)} – ${show(to, true)}`
      if (from) return `after ${show(from, true)}`
      if (to) return `before ${show(to, true)}`
      return ''
    }
    case 'text':
      return `“${String(value)}”`
  }
}

type S = ReturnType<typeof filterChipStyles>

// The editors (option lists, calendar) load the first time a filter is opened, so tables
// that never filter don't ship the calendar and its date library.
const FilterEditor = lazy(() =>
  import('./filter-editors').then((m) => ({ default: m.FilterEditor })),
)

/** One active filter: `Status | is any of | Paid, Open | ×`. The value opens its editor. */
function FilterChip<T>({
  column,
  config,
  counts,
  open,
  onOpenChange,
  s,
}: {
  column: Column<T, unknown>
  config: ColumnFilterConfig
  counts: Map<string, number> | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
  s: S
}) {
  const label = columnLabel(column)
  const value = column.getFilterValue()
  const active = isActiveFilter(config.type, value)
  return (
    <span data-slot="filter-chip" className={s.chip()}>
      <span className={s.part()}>{label}</span>
      <span className={s.operator()}>{operators[config.type]}</span>
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger className={s.value()} aria-label={`Edit ${label} filter`}>
          <span className={s.valueText()}>
            {active ? (
              filterSummary(config, value)
            ) : (
              <span className="text-faint-foreground">…</span>
            )}
          </span>
        </PopoverTrigger>
        <PopoverContent align="start" className={s.editor()}>
          <Suspense
            fallback={
              <div className="flex justify-center p-4">
                <Spinner size="sm" />
              </div>
            }
          >
            <FilterEditor
              column={column as Column<unknown, unknown>}
              config={config}
              counts={counts}
              s={s}
            />
          </Suspense>
        </PopoverContent>
      </Popover>
      <button
        type="button"
        className={s.remove()}
        aria-label={`Remove ${label} filter`}
        onClick={() => column.setFilterValue(undefined)}
      >
        <XIcon />
      </button>
    </span>
  )
}

export interface FilterBarProps<T> {
  table: Table<T>
  /** Count option matches from the loaded rows (client mode). */
  countFacets: boolean
}

/** The Filter menu, active filter chips and "Clear filters". */
export function FilterBar<T>({ table, countFacets }: FilterBarProps<T>) {
  const s = filterChipStyles()
  const columns = table
    .getAllLeafColumns()
    .filter((column) => column.columnDef.meta?.filter && column.getCanFilter())
  // A chip added from the menu stays while its editor is open, even before it has a value.
  const [pending, setPending] = useState<string | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  // Set when a column is picked from the Filter menu; its chip opens as the menu closes.
  const openAfterMenu = useRef<string | null>(null)
  const filters = table.getState().columnFilters
  // A chip shows while its filter has a value, or while it is new or being edited.
  const shown = columns.filter((column) => {
    const config = column.columnDef.meta?.filter as ColumnFilterConfig
    return (
      column.id === pending ||
      column.id === openId ||
      isActiveFilter(config.type, column.getFilterValue())
    )
  })
  if (columns.length === 0) return null
  const available = columns.filter((column) => !shown.includes(column))

  return (
    <>
      {shown.map((column) => {
        const config = column.columnDef.meta?.filter as ColumnFilterConfig
        const counts =
          countFacets && (config.type === 'multi' || config.type === 'select')
            ? countValues(column.getFacetedRowModel().rows, column.id)
            : undefined
        return (
          <FilterChip
            key={column.id}
            column={column}
            config={config}
            counts={counts}
            s={s}
            open={openId === column.id}
            onOpenChange={(open) => {
              setOpenId(open ? column.id : null)
              if (!open && pending === column.id) setPending(null)
            }}
          />
        )
      })}
      {available.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" leftIcon={<FilterIcon />}>
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            onCloseAutoFocus={(event) => {
              // Instead of returning focus to the Filter button, open the new chip's editor.
              const id = openAfterMenu.current
              if (!id) return
              openAfterMenu.current = null
              event.preventDefault()
              setOpenId(id)
            }}
          >
            {available.map((column) => (
              <DropdownMenuItem
                key={column.id}
                onSelect={() => {
                  openAfterMenu.current = column.id
                  setPending(column.id)
                }}
              >
                {columnLabel(column)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {filters.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setPending(null)
            table.resetColumnFilters(true)
          }}
        >
          Clear filters
        </Button>
      )}
    </>
  )
}
