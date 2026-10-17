import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type RowData,
  type RowSelectionState,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { Button, IconButton } from '../../components/button'
import { Checkbox } from '../../components/checkbox'
import { Input } from '../../components/input'
import { Skeleton } from '../../components/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/table'
import { useComponentConfig } from '../../hooks/use-component-config'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  SearchIcon,
} from '../../internal/icons'
import type { StylesEntry } from '../../utils/registry'
import { focusRing, themedBorder } from '../../utils/styles'
import { tv, type VariantProps } from '../../utils/tv'
import { EmptyState, ErrorState } from '../async/states'

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Cell and header alignment. Use `right` for numbers. */
    align?: 'left' | 'center' | 'right'
    /** Extra classes for this column's cells. */
    className?: string
  }
}

export const dataTableStyles = /* @__PURE__ */ tv({
  slots: {
    root: 'flex min-w-0 flex-col',
    toolbar: 'flex flex-wrap items-center gap-2',
    search: 'w-full sm:max-w-64',
    actions: 'ml-auto flex items-center gap-2',
    sortButton: [
      '-ml-1.5 inline-flex cursor-pointer items-center gap-1 rounded-xs px-1.5 py-1 hover:text-foreground [&>svg]:size-3.5',
      focusRing,
    ],
    footer:
      'flex flex-wrap items-center justify-between gap-3 text-small text-muted-foreground tabular-nums',
    pager: 'flex items-center gap-1',
  },
  variants: {
    variant: {
      card: {
        root: ['overflow-hidden rounded-lg border-border bg-surface shadow-sm', themedBorder],
        toolbar: 'border-b border-border p-3',
        footer: 'border-t border-border px-4 py-2.5',
      },
      plain: { root: 'gap-3' },
    },
  },
  defaultVariants: { variant: 'card' },
})

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    DataTable: StylesEntry<typeof dataTableStyles>
  }
}

const alignClass = { left: 'text-left', center: 'text-center', right: 'text-right' } as const
const NO_ROWS: never[] = []

export interface DataTableProps<T> extends VariantProps<typeof dataTableStyles> {
  data: T[] | undefined
  /** Build with `createColumnHelper<T>()` for typed accessors. */
  // biome-ignore lint/suspicious/noExplicitAny: TanStack's own convention for mixed column value types
  columns: ColumnDef<T, any>[]
  /** Shows skeleton rows. */
  loading?: boolean
  /** Shows an error state with a retry button when `onRetry` is set. */
  error?: unknown
  onRetry?: () => unknown
  getRowId?: (row: T, index: number) => string
  /** Rows per page, or `false` to show every row. Default 10. */
  pageSize?: number | false
  /** Adds a checkbox column. */
  selectable?: boolean
  onSelectionChange?: (rows: T[]) => void
  /** Adds a search box that filters across all columns. */
  search?: boolean | { placeholder?: string }
  /** Extra controls at the end of the toolbar (filters, buttons). */
  toolbar?: ReactNode
  /** Shown when there are no rows at all (not when a search matches nothing). */
  empty?: ReactNode
  initialSorting?: SortingState
  'aria-label'?: string
  className?: string
}

function selectColumn<T>(): ColumnDef<T> {
  return {
    id: '__select',
    enableSorting: false,
    enableGlobalFilter: false,
    header: ({ table }) => (
      <Checkbox
        className="mt-0"
        aria-label="Select all rows on this page"
        checked={
          table.getIsAllPageRowsSelected()
            ? true
            : table.getIsSomePageRowsSelected()
              ? 'indeterminate'
              : false
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(value === true)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        className="mt-0"
        aria-label="Select row"
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onCheckedChange={(value) => row.toggleSelected(value === true)}
      />
    ),
  }
}

/**
 * A table with sorting, search, pagination and row selection, plus built-in loading,
 * empty, no-results and error states. Columns are typed from your row type.
 */
export function DataTable<T>(inProps: DataTableProps<T>) {
  const [props, slots] = useComponentConfig('DataTable', inProps)
  const {
    data,
    columns,
    loading = false,
    error,
    onRetry,
    getRowId,
    pageSize = 10,
    selectable = false,
    onSelectionChange,
    search = false,
    toolbar,
    empty,
    initialSorting = [],
    variant,
    className,
    'aria-label': ariaLabel,
  } = props

  const [sorting, setSorting] = useState<SortingState>(initialSorting)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = useState('')
  const allColumns = useMemo(
    () => (selectable ? [selectColumn<T>(), ...columns] : columns),
    [selectable, columns],
  )

  const table = useReactTable<T>({
    data: data ?? NO_ROWS,
    columns: allColumns,
    state: { sorting, rowSelection, globalFilter },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    enableRowSelection: selectable,
    sortDescFirst: false,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(getRowId && { getRowId }),
    ...(pageSize !== false && {
      getPaginationRowModel: getPaginationRowModel(),
      initialState: { pagination: { pageIndex: 0, pageSize } },
    }),
  })

  // biome-ignore lint/correctness/useExhaustiveDependencies: report only when the selection changes
  useEffect(() => {
    onSelectionChange?.(table.getSelectedRowModel().rows.map((row) => row.original))
  }, [rowSelection])

  const s = dataTableStyles({ variant })
  const columnCount = table.getVisibleLeafColumns().length
  const rows = table.getRowModel().rows
  const filteredTotal = table.getFilteredRowModel().rows.length
  const selectedCount = Object.keys(rowSelection).length
  const { pageIndex, pageSize: size } = table.getState().pagination
  const showFooter = pageSize !== false && !loading && !error && filteredTotal > 0
  const searchPlaceholder = typeof search === 'object' ? search.placeholder : undefined

  const fullWidthRow = (content: ReactNode) => (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={columnCount} className="p-0">
        {content}
      </TableCell>
    </TableRow>
  )

  let body: ReactNode
  if (loading) {
    body = Array.from({ length: pageSize === false ? 5 : Math.min(pageSize, 8) }, (_, i) => (
      <TableRow key={i} className="hover:bg-transparent">
        {table.getVisibleLeafColumns().map((column) => (
          <TableCell key={column.id}>
            <Skeleton className={column.id === '__select' ? 'size-4' : 'h-4 w-[70%]'} />
          </TableCell>
        ))}
      </TableRow>
    ))
  } else if (error) {
    body = fullWidthRow(<ErrorState error={error} onRetry={onRetry} />)
  } else if (rows.length === 0) {
    body = fullWidthRow(
      globalFilter ? (
        <EmptyState
          icon={<SearchIcon />}
          title={`No results for “${globalFilter}”`}
          description="Check the spelling or try a shorter search."
          action={
            <Button variant="outline" size="sm" onClick={() => setGlobalFilter('')}>
              Clear search
            </Button>
          }
        />
      ) : (
        (empty ?? <EmptyState title="No rows yet" />)
      ),
    )
  } else {
    body = rows.map((row) => (
      <TableRow key={row.id} data-state={row.getIsSelected() ? 'selected' : undefined}>
        {row.getVisibleCells().map((cell) => {
          const meta = cell.column.columnDef.meta
          return (
            <TableCell
              key={cell.id}
              className={[alignClass[meta?.align ?? 'left'], meta?.className].join(' ')}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          )
        })}
      </TableRow>
    ))
  }

  return (
    <div data-slot="data-table" className={s.root({ class: [slots.root, className] })}>
      {(search || toolbar) && (
        <div className={s.toolbar({ class: slots.toolbar })}>
          {search && (
            <Input
              size="sm"
              type="search"
              aria-label="Search rows"
              placeholder={searchPlaceholder ?? 'Search…'}
              prefix={<SearchIcon />}
              value={globalFilter}
              onChange={(event) => {
                setGlobalFilter(event.target.value)
                table.setPageIndex(0)
              }}
              className={s.search({ class: slots.search })}
            />
          )}
          {toolbar && <div className={s.actions({ class: slots.actions })}>{toolbar}</div>}
        </div>
      )}

      <Table aria-label={ariaLabel} aria-busy={loading || undefined}>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id} className="hover:bg-transparent">
              {group.headers.map((header) => {
                const column = header.column
                const sorted = column.getIsSorted()
                const align = column.columnDef.meta?.align ?? 'left'
                const label = header.isPlaceholder
                  ? null
                  : flexRender(column.columnDef.header, header.getContext())
                return (
                  <TableHead
                    key={header.id}
                    className={alignClass[align]}
                    aria-sort={
                      sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : undefined
                    }
                  >
                    {column.getCanSort() && !header.isPlaceholder ? (
                      <button
                        type="button"
                        onClick={column.getToggleSortingHandler()}
                        className={s.sortButton({
                          class: [slots.sortButton, align === 'right' && 'flex-row-reverse'],
                        })}
                      >
                        {label}
                        {sorted === 'asc' ? (
                          <ArrowUpIcon />
                        ) : sorted === 'desc' ? (
                          <ArrowDownIcon />
                        ) : (
                          <ChevronsUpDownIcon className="opacity-40" />
                        )}
                      </button>
                    ) : (
                      label
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>{body}</TableBody>
      </Table>

      {showFooter && (
        <div className={s.footer({ class: slots.footer })}>
          <p>
            {pageIndex * size + 1}–{Math.min((pageIndex + 1) * size, filteredTotal)} of{' '}
            {filteredTotal}
            {selectedCount > 0 && (
              <span className="text-foreground"> · {selectedCount} selected</span>
            )}
          </p>
          <div className={s.pager({ class: slots.pager })}>
            <IconButton
              variant="outline"
              size="sm"
              icon={<ChevronLeftIcon />}
              aria-label="Previous page"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
            />
            <IconButton
              variant="outline"
              size="sm"
              icon={<ChevronRightIcon />}
              aria-label="Next page"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
            />
          </div>
        </div>
      )}
    </div>
  )
}
