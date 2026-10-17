import { cn } from '@glyphui/ui'
import {
  type ColumnDef,
  type ColumnFilterConfig,
  createColumnHelper,
  DataTable,
} from '@glyphui/ui/data-table'
import { virtualRows } from '@glyphui/ui/data-table/virtual'
import { type ReactNode, useMemo } from 'react'
import type { TableColumn, TableData, TableRow } from './infer'

export interface TableViewProps {
  data: TableData
  /** Label for the table, read by screen readers. */
  label: string
  /** Extra toolbar controls, after search and the view menu. */
  toolbar?: ReactNode
  /** Height of the scrolling table. Default 480. */
  height?: number | string
  /** File name for the CSV export, without extension. */
  exportName?: string
  className?: string
}

const formatters = new Map<string, Intl.NumberFormat>()
function formatNumber(value: number): string {
  const decimals = Number.isInteger(value)
    ? 0
    : Math.min(String(value).split('.')[1]?.length ?? 2, 6)
  const key = String(decimals)
  let format = formatters.get(key)
  if (!format) {
    format = new Intl.NumberFormat(undefined, { maximumFractionDigits: decimals })
    formatters.set(key, format)
  }
  return format.format(value)
}

const dayFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeZone: 'UTC' })
const dateTimeFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})
function formatDate(value: string): string {
  const date = new Date(value.length === 10 ? `${value}T00:00:00Z` : value)
  if (Number.isNaN(date.getTime())) return value
  return value.length === 10 ? dayFormat.format(date) : dateTimeFormat.format(date)
}

function filterFor(column: TableColumn, rows: readonly TableRow[]): ColumnFilterConfig {
  switch (column.type) {
    case 'number': {
      let min = Number.POSITIVE_INFINITY
      let max = Number.NEGATIVE_INFINITY
      for (const row of rows) {
        const v = row[column.id]
        if (typeof v === 'number') {
          if (v < min) min = v
          if (v > max) max = v
        }
      }
      return Number.isFinite(min)
        ? { type: 'range', min, max, format: formatNumber }
        : { type: 'range' }
    }
    case 'date':
      return { type: 'date-range' }
    case 'boolean':
      return {
        type: 'select',
        options: [
          { value: 'true', label: 'Yes' },
          { value: 'false', label: 'No' },
        ],
      }
    default:
      return column.options
        ? { type: 'multi', options: column.options.map((value) => ({ value, label: value })) }
        : { type: 'text', placeholder: `Contains…` }
  }
}

function Empty() {
  return <span className="text-faint-foreground">—</span>
}

// Created once: the virtualizer is a stable description, not state.
const virtualizers = new Map<string, ReturnType<typeof virtualRows>>()
function virtualizerFor(height: number | string) {
  const key = String(height)
  let v = virtualizers.get(key)
  if (!v) {
    v = virtualRows({ height, overscan: 12 })
    virtualizers.set(key, v)
  }
  return v
}

/** Typed rows from a CSV or spreadsheet, rendered with DataTable's search, filters and export. */
export function TableView({
  data,
  label,
  toolbar,
  height = 480,
  exportName,
  className,
}: TableViewProps) {
  const columns = useMemo(() => {
    const col = createColumnHelper<TableRow>()
    return data.columns.map((column) =>
      col.accessor((row) => row[column.id], {
        id: column.id,
        header: column.label,
        cell: (info) => {
          const value = info.getValue()
          if (value === null || value === undefined || value === '') return <Empty />
          if (column.type === 'number') {
            return column.identifier ? String(value) : formatNumber(value as number)
          }
          if (column.type === 'date') return formatDate(String(value))
          if (column.type === 'boolean') return value ? 'Yes' : 'No'
          return String(value)
        },
        // Booleans compare as strings in the select filter.
        ...(column.type === 'boolean' && {
          filterFn: (row, id, wanted) =>
            wanted === undefined || wanted === '' || String(row.getValue(id)) === String(wanted),
        }),
        sortUndefined: 'last',
        meta: {
          ...(column.type === 'number' && { align: 'right' as const }),
          filter: filterFor(column, data.rows),
          className: column.type === 'number' ? 'tabular-nums' : 'max-w-96 truncate',
          ...(column.identifier && { align: 'left' as const }),
        },
      }),
    ) as ColumnDef<TableRow, unknown>[]
  }, [data])

  return (
    <DataTable
      aria-label={label}
      className={cn('min-h-0', className)}
      data={data.rows}
      columns={columns}
      getRowId={(row) => String(row.__row)}
      pageSize={false}
      virtualize={virtualizerFor(height)}
      search={{ placeholder: 'Search rows…' }}
      columnControls={{ hide: true, resize: true, pin: true, reorder: false }}
      exportCsv={{ fileName: exportName ?? 'export' }}
      toolbar={toolbar}
      mobile="scroll"
    />
  )
}
