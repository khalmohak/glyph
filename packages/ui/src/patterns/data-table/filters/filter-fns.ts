import type { ColumnDef, ColumnFiltersState, FilterFn, Row } from '@tanstack/react-table'
import type {
  ColumnFilterConfig,
  DateRangeFilterValue,
  FilterType,
  RangeFilterValue,
} from '../types'

/** A `multi` filter value: always an array, even when the URL held a single value. */
export function toList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String)
  if (value === undefined || value === null || value === '') return []
  return [String(value)]
}

/**
 * The values of a `multi` (or `select`) filter as an array, whatever shape it arrived in.
 * Use it in server-mode fetchers: `getFilterList(state.columnFilters, 'status')`.
 */
export function getFilterList(filters: ColumnFiltersState | undefined, id: string): string[] {
  return toList(filters?.find((filter) => filter.id === id)?.value)
}

/** Filter types by column id, from each column's `meta.filter` (ids resolved like TanStack's). */
export function filterTypesOf(
  // biome-ignore lint/suspicious/noExplicitAny: TanStack's own convention for mixed column value types
  columns: readonly ColumnDef<any, any>[],
  into: Record<string, FilterType> = {},
): Record<string, FilterType> {
  for (const column of columns) {
    const nested = (column as { columns?: ColumnDef<unknown, unknown>[] }).columns
    if (nested) {
      filterTypesOf(nested, into)
      continue
    }
    const type = (column.meta as { filter?: ColumnFilterConfig } | undefined)?.filter?.type
    if (!type) continue
    const accessorKey = (column as { accessorKey?: unknown }).accessorKey
    const id =
      column.id ??
      (typeof accessorKey === 'string' ? accessorKey.replaceAll('.', '_') : undefined) ??
      (typeof column.header === 'string' ? column.header : undefined)
    if (id) into[id] = type
  }
  return into
}

/** Puts filter values in the shape their filter type expects: `multi` values become arrays. */
export function normalizeFilters(
  filters: ColumnFiltersState,
  types: Record<string, FilterType>,
): ColumnFiltersState {
  let changed = false
  const next = filters.map((filter) => {
    if (types[filter.id] !== 'multi' || Array.isArray(filter.value)) return filter
    changed = true
    return { ...filter, value: toList(filter.value) }
  })
  return changed ? next : filters
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value)
    return Number.isFinite(n) ? n : undefined
  }
  return undefined
}

/** Days as `yyyy-mm-dd` in local time, so ranges compare whole days. */
export function toDay(value: unknown): string | undefined {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return undefined
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`
  }
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    // A full ISO timestamp is converted to the local day it falls on.
    return value.length > 10 ? toDay(new Date(value)) : value.slice(0, 10)
  }
  if (typeof value === 'number') return toDay(new Date(value))
  return undefined
}

/** A `yyyy-mm-dd` day as a local Date. */
export function parseDay(day: string): Date {
  const [y, m, d] = day.split('-').map(Number)
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1)
}

/** Whether a filter value is set, so empty chips don't filter anything. */
export function isActiveFilter(type: FilterType, value: unknown): boolean {
  switch (type) {
    case 'multi':
      return toList(value).length > 0
    case 'range': {
      const v = (value ?? {}) as RangeFilterValue
      return toNumber(v.min) !== undefined || toNumber(v.max) !== undefined
    }
    case 'date-range': {
      const v = (value ?? {}) as DateRangeFilterValue
      return Boolean(v.from || v.to)
    }
    default:
      return typeof value === 'string' ? value !== '' : value !== undefined && value !== null
  }
}

const filterFns: Record<FilterType, FilterFn<unknown>> = {
  select: (row, id, value) => isEmpty(value) || String(row.getValue(id)) === String(value),
  multi: (row, id, value) => {
    const wanted = toList(value)
    if (wanted.length === 0) return true
    const cell = row.getValue(id)
    // Array cells (tags) match when they share any value.
    if (Array.isArray(cell)) return cell.some((item) => wanted.includes(String(item)))
    return wanted.includes(String(cell))
  },
  range: (row, id, value) => {
    const { min, max } = (value ?? {}) as RangeFilterValue
    const n = toNumber(row.getValue(id))
    if (n === undefined) return toNumber(min) === undefined && toNumber(max) === undefined
    const lo = toNumber(min)
    const hi = toNumber(max)
    return (lo === undefined || n >= lo) && (hi === undefined || n <= hi)
  },
  'date-range': (row, id, value) => {
    const { from, to } = (value ?? {}) as DateRangeFilterValue
    if (!from && !to) return true
    const day = toDay(row.getValue(id))
    if (!day) return false
    return (!from || day >= from) && (!to || day <= to)
  },
  text: (row, id, value) => {
    if (isEmpty(value)) return true
    const cell = row.getValue(id)
    return String(cell ?? '')
      .toLowerCase()
      .includes(String(value).toLowerCase())
  },
}

function isEmpty(value: unknown) {
  return value === undefined || value === null || value === ''
}

for (const [type, fn] of Object.entries(filterFns)) {
  // Drop the filter (instead of storing an empty value) when the editor clears it.
  fn.autoRemove = (value: unknown) => !isActiveFilter(type as FilterType, value)
}

export function filterFnFor(config: ColumnFilterConfig): FilterFn<unknown> {
  return filterFns[config.type]
}

/** Gives every column with `meta.filter` and no `filterFn` the matching filter function. */
export function withFilterFns<T>(
  // biome-ignore lint/suspicious/noExplicitAny: TanStack's own convention for mixed column value types
  columns: ColumnDef<T, any>[],
  // biome-ignore lint/suspicious/noExplicitAny: as above
): ColumnDef<T, any>[] {
  let changed = false
  const next = columns.map((column) => {
    const nested = (column as { columns?: ColumnDef<T, unknown>[] }).columns
    if (nested) {
      const inner = withFilterFns(nested)
      if (inner === nested) return column
      changed = true
      return { ...column, columns: inner }
    }
    const filter = column.meta?.filter
    if (!filter || column.filterFn) return column
    changed = true
    return { ...column, filterFn: filterFnFor(filter) as FilterFn<T> }
  })
  return changed ? next : columns
}

/** Counts rows per option value for `multi` and `select` filters (client mode). */
export function countValues<T>(rows: Row<T>[], columnId: string): Map<string, number> {
  const counts = new Map<string, number>()
  for (const row of rows) {
    const cell = row.getValue(columnId)
    const values = Array.isArray(cell) ? cell : [cell]
    for (const value of values) {
      const key = String(value)
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
  }
  return counts
}
