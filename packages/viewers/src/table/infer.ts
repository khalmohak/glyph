/** What a column holds, guessed from its values. Drives alignment, sorting and filters. */
export type ColumnType = 'number' | 'date' | 'boolean' | 'text'

export interface TableColumn {
  /** Stable id, `c0`, `c1`, … (header text can repeat or contain dots). */
  id: string
  label: string
  type: ColumnType
  /** Numbers that name things (ids, codes, years) show without thousands separators. */
  identifier?: boolean
  /** Distinct values when there are few of them, for a multi-select filter. */
  options?: string[]
}

export type TableRow = Record<string, unknown>

export interface TableData {
  columns: TableColumn[]
  rows: TableRow[]
}

const NUMBER = /^[-+]?(?:\d{1,3}(?:,\d{3})+|\d+)?(?:\.\d+)?(?:e[-+]?\d+)?$/i
const ISO_DATE =
  /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/
const BOOLEAN = /^(?:true|false|yes|no)$/i

/** Values read from the file: strings from CSV, typed values from spreadsheets. */
export type RawValue = string | number | boolean | Date | null | undefined

function isEmpty(value: RawValue): boolean {
  return value === null || value === undefined || (typeof value === 'string' && value.trim() === '')
}

function looksLikeNumber(value: RawValue): boolean {
  if (typeof value === 'number') return Number.isFinite(value)
  if (typeof value !== 'string') return false
  const v = value.trim()
  return v !== '' && v !== '.' && v !== '-' && v !== '+' && NUMBER.test(v)
}

function looksLikeDate(value: RawValue): boolean {
  if (value instanceof Date) return !Number.isNaN(value.getTime())
  return (
    typeof value === 'string' && ISO_DATE.test(value.trim()) && !Number.isNaN(Date.parse(value))
  )
}

function looksLikeBoolean(value: RawValue): boolean {
  return typeof value === 'boolean' || (typeof value === 'string' && BOOLEAN.test(value.trim()))
}

/**
 * Guesses a column's type from up to `sample` non-empty values. A type wins when at least
 * 95% of them match it, so one stray "n/a" doesn't turn a number column into text.
 */
export function inferColumnType(values: readonly RawValue[], sample = 1000): ColumnType {
  const filled = values.filter((v) => !isEmpty(v)).slice(0, sample)
  if (filled.length === 0) return 'text'
  const share = (test: (v: RawValue) => boolean) => filled.filter(test).length / filled.length
  if (share(looksLikeBoolean) >= 0.95) return 'boolean'
  if (share(looksLikeNumber) >= 0.95) return 'number'
  if (share(looksLikeDate) >= 0.95) return 'date'
  return 'text'
}

/** Converts a raw value to its column's type. Unparseable values become `null`. */
export function coerce(value: RawValue, type: ColumnType): unknown {
  if (isEmpty(value)) return null
  switch (type) {
    case 'number': {
      if (typeof value === 'number') return value
      const n = Number(String(value).trim().replace(/,/g, ''))
      return Number.isFinite(n) ? n : null
    }
    case 'boolean': {
      if (typeof value === 'boolean') return value
      return /^(?:true|yes)$/i.test(String(value).trim())
    }
    case 'date': {
      // Dates are kept as ISO strings: they sort correctly and filter by day.
      if (value instanceof Date) return toIsoDay(value)
      const s = String(value).trim()
      return looksLikeDate(s) ? s : null
    }
    default:
      return value instanceof Date ? toIsoDay(value) : String(value)
  }
}

function toIsoDay(date: Date): string {
  const hasTime =
    date.getUTCHours() !== 0 || date.getUTCMinutes() !== 0 || date.getUTCSeconds() !== 0
  return hasTime ? date.toISOString() : date.toISOString().slice(0, 10)
}

/**
 * Whether the first row is a header: every cell filled, no repeats, and none of them looks
 * like data (a number, a date or a boolean).
 */
export function looksLikeHeader(rows: readonly (readonly RawValue[])[]): boolean {
  const first = rows[0]
  if (!first || first.length === 0) return false
  const cells = first.map((v) => (v === null || v === undefined ? '' : String(v).trim()))
  if (cells.some((c) => c === '')) return false
  if (new Set(cells).size !== cells.length) return false
  return !first.some((v) => looksLikeNumber(v) || looksLikeDate(v) || typeof v === 'boolean')
}

const MAX_OPTIONS = 20
const IDENTIFIER = /(^|[\s_-])(id|code|zip|postcode|year|no|number|#)$/i

/**
 * Turns a grid of raw cells into typed columns and rows. `header` decides whether the first
 * row names the columns; otherwise they're named A, B, C… like a spreadsheet.
 */
export function buildTable(grid: readonly (readonly RawValue[])[], header: boolean): TableData {
  const width = grid.reduce((max, row) => Math.max(max, row.length), 0)
  const body = header ? grid.slice(1) : grid
  const labels = Array.from({ length: width }, (_, i) => {
    const text = header ? String(grid[0]?.[i] ?? '').trim() : ''
    return text || columnLetter(i)
  })
  const columns: TableColumn[] = labels.map((label, i) => {
    const values = body.map((row) => row[i])
    const type = inferColumnType(values)
    const column: TableColumn = { id: `c${i}`, label, type }
    if (type === 'number' && IDENTIFIER.test(label)) column.identifier = true
    if (type === 'text') {
      const distinct = new Set<string>()
      for (const v of values) {
        if (isEmpty(v)) continue
        distinct.add(String(v))
        if (distinct.size > MAX_OPTIONS) break
      }
      // Few distinct values that repeat: offer them as a multi-select filter.
      if (distinct.size > 0 && distinct.size <= MAX_OPTIONS && distinct.size < body.length / 2) {
        column.options = [...distinct].sort((a, b) => a.localeCompare(b))
      }
    }
    return column
  })
  const rows = body.map((row, r) => {
    const out: TableRow = { __row: r }
    columns.forEach((column, i) => {
      out[column.id] = coerce(row[i], column.type)
    })
    return out
  })
  return { columns, rows }
}

/** 0 → A, 25 → Z, 26 → AA. */
export function columnLetter(index: number): string {
  let n = index + 1
  let s = ''
  while (n > 0) {
    const rem = (n - 1) % 26
    s = String.fromCharCode(65 + rem) + s
    n = Math.floor((n - 1) / 26)
  }
  return s
}
