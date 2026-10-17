import type { Column, ColumnDef, Row, Table } from '@tanstack/react-table'

export interface CsvOptions {
  /** Field separator. Default `,`. */
  delimiter?: string
  /** Line ending. Default `\r\n`, which every spreadsheet app reads. */
  newline?: string
  /**
   * Prefixes text that starts with `=`, `+`, `-`, `@`, tab or carriage return with `'`, so a
   * spreadsheet doesn't run it as a formula (CSV injection). Numbers are left alone.
   * Default true.
   */
  escapeFormulas?: boolean
}

const FORMULA_START = /^[=+\-@\t\r]/

function cellText(value: unknown, escapeFormulas: boolean): string {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? '' : value.toISOString()
  if (typeof value === 'number' || typeof value === 'bigint' || typeof value === 'boolean')
    return String(value)
  if (Array.isArray(value)) return value.map((item) => cellText(item, false)).join(', ')
  const text = typeof value === 'object' ? JSON.stringify(value) : String(value)
  return escapeFormulas && FORMULA_START.test(text) ? `'${text}` : text
}

/**
 * Turns rows of values into CSV text: fields that contain the delimiter, quotes, line
 * breaks or edge spaces are quoted, and quotes are doubled (RFC 4180).
 */
export function toCsv(
  rows: readonly (readonly unknown[])[],
  { delimiter = ',', newline = '\r\n', escapeFormulas = true }: CsvOptions = {},
): string {
  return rows
    .map((row) =>
      row
        .map((value) => {
          const text = cellText(value, escapeFormulas)
          const needsQuotes =
            text.includes(delimiter) || /["\r\n]/.test(text) || text !== text.trim()
          return needsQuotes ? `"${text.replaceAll('"', '""')}"` : text
        })
        .join(delimiter),
    )
    .join(newline)
}

/** The plain-text name of a column: `meta.label`, a string header, or the id. */
// biome-ignore lint/suspicious/noExplicitAny: accepts columns of any value type
export function columnLabel<T>(column: Column<T, any>): string {
  const meta = column.columnDef.meta
  if (meta?.label) return meta.label
  const header = column.columnDef.header
  return typeof header === 'string' ? header : column.id
}

/** Columns that hold data (not the checkbox, expander or action columns). */
export function exportableColumns<T>(table: Table<T>): Column<T, unknown>[] {
  return table
    .getVisibleLeafColumns()
    .filter((column) => column.accessorFn !== undefined && column.columnDef.meta?.csv !== false)
}

/** Builds CSV text for the given rows of a table, using its visible data columns. */
export function tableRowsToCsv<T>(
  table: Table<T>,
  rows: readonly Row<T>[],
  options?: CsvOptions,
): string {
  const columns = exportableColumns(table)
  const header = columns.map(columnLabel)
  const body = rows.map((row) =>
    columns.map((column) => {
      const value = row.getValue(column.id)
      const csv = column.columnDef.meta?.csv
      return typeof csv === 'function' ? csv(value, row.original) : value
    }),
  )
  return toCsv([header, ...body], options)
}

/** Starts a browser download of `text` as a file. */
export function downloadText(text: string, fileName: string, type = 'text/csv;charset=utf-8') {
  const blob = new Blob([text], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.style.display = 'none'
  document.body.append(link)
  link.click()
  link.remove()
  // Give the browser a moment to start the download before freeing the blob.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export interface ExportTableCsvOptions<T> extends CsvOptions {
  data: readonly T[]
  /** The same column definitions you pass to DataTable. Display-only columns are skipped. */
  // biome-ignore lint/suspicious/noExplicitAny: TanStack's own convention for mixed column value types
  columns: readonly ColumnDef<T, any>[]
  /** Default `export.csv`. */
  fileName?: string
  /** Starts with a byte-order mark so Excel reads UTF-8 correctly. Default true. */
  bom?: boolean
  /** Set `false` to only build the text. Default true in the browser. */
  download?: boolean
}

type LeafDef<T> = ColumnDef<T, unknown> & {
  id?: string
  accessorKey?: string
  accessorFn?: (row: T, index: number) => unknown
  columns?: ColumnDef<T, unknown>[]
}

function leaves<T>(columns: readonly ColumnDef<T, unknown>[]): LeafDef<T>[] {
  return columns.flatMap((column) => {
    const def = column as LeafDef<T>
    return def.columns ? leaves(def.columns) : [def]
  })
}

function readKey(row: unknown, key: string): unknown {
  // TanStack accessor keys may be dotted paths into nested objects.
  return key.split('.').reduce<unknown>((value, part) => {
    if (value === null || value === undefined) return undefined
    return (value as Record<string, unknown>)[part]
  }, row)
}

/**
 * Exports rows to a CSV file without rendering a table, for "Export all" against an API:
 *
 * ```ts
 * exportTableCsv({ data: await api.invoices.all(), columns, fileName: 'invoices.csv' })
 * ```
 *
 * Returns the CSV text.
 */
export function exportTableCsv<T>({
  data,
  columns,
  fileName = 'export.csv',
  bom = true,
  download = typeof document !== 'undefined',
  ...options
}: ExportTableCsvOptions<T>): string {
  const defs = leaves(columns as readonly ColumnDef<T, unknown>[]).filter(
    (def) => (def.accessorKey !== undefined || def.accessorFn) && def.meta?.csv !== false,
  )
  const header = defs.map(
    (def) =>
      def.meta?.label ??
      (typeof def.header === 'string' ? def.header : (def.id ?? def.accessorKey ?? '')),
  )
  const body = data.map((row, index) =>
    defs.map((def) => {
      const value = def.accessorFn
        ? def.accessorFn(row, index)
        : readKey(row, def.accessorKey as string)
      const csv = def.meta?.csv
      return typeof csv === 'function' ? csv(value, row) : value
    }),
  )
  const text = toCsv([header, ...body], options)
  if (download) downloadText(bom ? `﻿${text}` : text, fileName)
  return text
}
