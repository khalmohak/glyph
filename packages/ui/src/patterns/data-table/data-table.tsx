import {
  type Cell,
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type Row,
  type SortingState,
  type Updater,
  useReactTable,
} from '@tanstack/react-table'
import { AnimatePresence, m } from 'motion/react'
import {
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Button } from '../../components/button'
import { Checkbox } from '../../components/checkbox'
import { Input } from '../../components/input'
import { Skeleton } from '../../components/skeleton'
import { TableBody, TableCell, TableHeader, TableRow } from '../../components/table'
import { useComponentConfig } from '../../hooks/use-component-config'
import { useMediaQuery } from '../../hooks/use-media-query'
import { ChevronRightIcon, SearchIcon } from '../../internal/icons'
import { useMotionSettings } from '../../motion/use-motion-settings'
import { useLinkComponent } from '../../provider/glyph-context'
import { cn } from '../../utils/cn'
import { EmptyState, ErrorState } from '../async/states'
import { BulkBar } from './bulk-bar'
import { type ColumnControls, HeaderCell, INTERNAL_COLUMNS } from './column-header'
import { type DataTableVariants, dataTableStyles, densityClasses } from './data-table.styles'
import type { CellEditState, GlyphTableMeta } from './editable-cell'
import { FilterBar } from './filters/filter-bar'
import { withFilterFns } from './filters/filter-fns'
import { MobileCards } from './mobile-cards'
import { TableFooter } from './pagination'
import { TableToolbarMenus } from './toolbar'
import type { CellEdit, DataTableState, DataTableStateKey, Density, TableSelection } from './types'
import { useTableState } from './use-table-state'
import { VirtualRows } from './virtual-rows'
import type { DataTableVirtualizer } from './virtual-types'

const alignClass = { left: 'text-left', center: 'text-center', right: 'text-right' } as const
const NO_ROWS: never[] = []
const DEFAULT_PAGE_SIZES = [10, 20, 50, 100] as const
/** Clicks on these inside a clickable row act on themselves, not on the row. */
const INTERACTIVE =
  'a,button,input,select,textarea,label,[role="checkbox"],[role="button"],[role="menuitem"],[role="combobox"],[data-row-click="ignore"]'

type Styles = ReturnType<typeof dataTableStyles>
type Slots = Partial<Record<string, string>>

export interface DataTableProps<T> extends DataTableVariants {
  data: T[] | undefined
  /** Build with `createColumnHelper<T>()` for typed accessors. */
  // biome-ignore lint/suspicious/noExplicitAny: TanStack's own convention for mixed column value types
  columns: ColumnDef<T, any>[]
  /**
   * `client` (default) sorts, filters and pages `data` in the browser. `server` hands every
   * change to you through `onStateChange`: pass the current page as `data` and the total as
   * `rowCount`.
   */
  mode?: 'client' | 'server'
  /** Server mode: rows across all pages. Omit it and pass `hasNextPage` for cursor paging. */
  rowCount?: number
  /** Cursor paging (APIs without totals): whether a next page exists. */
  hasNextPage?: boolean
  /** Shows "Load more" instead of pages; append rows to `data` when it's called. */
  onLoadMore?: () => void
  /** Shows skeleton rows. In server mode the current rows stay, under a progress bar. */
  loading?: boolean
  /** Shows an error state with a retry button when `onRetry` is set. */
  error?: unknown
  onRetry?: () => unknown
  /** Stable row ids. Needed to keep selections across pages and data changes. */
  getRowId?: (row: T, index: number) => string

  /** Controlled state: any slice you pass is yours to update from `onStateChange`. */
  state?: Partial<DataTableState>
  /** Starting values for slices you don't control. */
  defaultState?: Partial<DataTableState>
  /** Called with the whole next state, and the slice that changed, on every change. */
  onStateChange?: (state: DataTableState, changed: DataTableStateKey) => void
  onSortingChange?: (sorting: SortingState) => void
  onPaginationChange?: (pagination: DataTableState['pagination']) => void
  onSearchChange?: (search: string) => void
  onColumnFiltersChange?: (filters: DataTableState['columnFilters']) => void

  /** Rows per page, or `false` to show every row. Default 10. */
  pageSize?: number | false
  /** Choices in "Rows per page". Default 10, 20, 50, 100. */
  pageSizeOptions?: readonly number[]
  initialSorting?: SortingState

  /** Adds a checkbox column. */
  selectable?: boolean
  /** Rows this returns false for get a disabled checkbox. */
  getRowCanSelect?: (row: T) => boolean
  onSelectionChange?: (rows: T[]) => void
  /** Actions for the selected rows, in a floating bar while any are selected. */
  bulkActions?: (selection: TableSelection<T>) => ReactNode

  /** Adds a search box. In client mode it matches every column. */
  search?: boolean | { placeholder?: string }
  /** Extra controls at the end of the toolbar. */
  toolbar?: ReactNode
  /**
   * Column features: `true` turns on hiding (a View menu and each column's menu), resizing,
   * pinning and reordering; or pick some.
   */
  columnControls?: boolean | Partial<ColumnControls>
  /** Adds compact / default / comfortable to the View menu. */
  densityToggle?: boolean
  /**
   * Adds an Export menu: this page, selected rows or all rows as CSV. In server mode pass
   * `fetchAll` so "All rows" can load every page.
   */
  exportCsv?: boolean | { fileName?: string; bom?: boolean; fetchAll?: () => Promise<T[]> | T[] }

  /** Makes rows clickable. Clicks on buttons, links and checkboxes inside are left alone. */
  onRowClick?: (row: T, event: MouseEvent<HTMLElement>) => void
  /** Makes each row a link: the first data column links there and the row is clickable. */
  getRowHref?: (row: T) => string
  /** Adds an expand button to each row; this content opens below it. */
  renderSubRow?: (row: T) => ReactNode
  getRowCanExpand?: (row: T) => boolean
  /** Saves edits from `editableCell()` columns. Reject to roll the cell back. */
  onCellEdit?: (edit: CellEdit<T>) => unknown

  /** Scrolls inside the table past this height, with the header pinned. */
  maxHeight?: number | string
  /** Below the `sm` breakpoint: scroll sideways (default) or show each row as a card. */
  mobile?: 'scroll' | 'cards'
  /** Renders only rows in view. Create with `virtualRows()` from `@glyphui/ui/data-table/virtual`. */
  virtualize?: DataTableVirtualizer
  /** Shown when there are no rows at all (not when a search matches nothing). */
  empty?: ReactNode
  'aria-label'?: string
  className?: string
}

function selectColumn<T>(): ColumnDef<T> {
  return {
    id: '__select',
    size: 40,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    enablePinning: false,
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

function expandColumn<T>(s: Styles, idPrefix: string): ColumnDef<T> {
  return {
    id: '__expand',
    size: 40,
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    enablePinning: false,
    enableGlobalFilter: false,
    header: () => <span className="sr-only">Details</span>,
    cell: ({ row }) =>
      row.getCanExpand() ? (
        <button
          type="button"
          className={s.expandButton()}
          aria-expanded={row.getIsExpanded()}
          aria-controls={row.getIsExpanded() ? `${idPrefix}-sub-${row.id}` : undefined}
          aria-label={row.getIsExpanded() ? 'Hide details' : 'Show details'}
          onClick={row.getToggleExpandedHandler()}
        >
          <ChevronRightIcon />
        </button>
      ) : null,
  }
}

function resolveControls(value: boolean | Partial<ColumnControls> | undefined): ColumnControls {
  if (value === true) return { hide: true, resize: true, pin: true, reorder: true }
  if (!value) return { hide: false, resize: false, pin: false, reorder: false }
  return {
    hide: value.hide ?? false,
    resize: value.resize ?? false,
    pin: value.pin ?? false,
    reorder: value.reorder ?? false,
  }
}

/** Moves `id` before `target` (or one step left / right), keeping built-in columns first. */
export function moveInOrder(order: readonly string[], id: string, target: string): string[] {
  const from = order.indexOf(id)
  const at = order.indexOf(target)
  if (from === -1 || at === -1 || from === at) return [...order]
  const next = order.filter((item) => item !== id)
  // Dropping on a column to the right lands after it; to the left, before it.
  const to = next.indexOf(target) + (at > from ? 1 : 0)
  next.splice(to, 0, id)
  const internal = next.filter((item) => INTERNAL_COLUMNS.has(item))
  return [...internal, ...next.filter((item) => !INTERNAL_COLUMNS.has(item))]
}

/** Leaf column ids the way TanStack derives them: `id`, else `accessorKey`, else a string header. */
// biome-ignore lint/suspicious/noExplicitAny: TanStack's own convention for mixed column value types
export function leafColumnIds<T>(columns: ColumnDef<T, any>[], into = new Set<string>()) {
  for (const column of columns) {
    const nested = (column as { columns?: ColumnDef<T, unknown>[] }).columns
    if (nested) {
      leafColumnIds(nested, into)
      continue
    }
    const accessorKey = (column as { accessorKey?: unknown }).accessorKey
    const id =
      column.id ??
      (typeof accessorKey === 'string' ? accessorKey.replaceAll('.', '_') : undefined) ??
      (typeof column.header === 'string' ? column.header : undefined)
    if (id) into.add(id)
  }
  return into
}

type Offsets = Record<string, { left?: number; right?: number }>

/** Sticky offsets for pinned columns, measured from the rendered header so they always line up. */
function usePinnedOffsets(tableRef: RefObject<HTMLTableElement | null>, key: string): Offsets {
  const [offsets, setOffsets] = useState<Offsets>({})
  const measure = useCallback(() => {
    const table = tableRef.current
    if (!table) return
    const heads = [...table.querySelectorAll<HTMLElement>('thead th[data-column-id]')]
    const next: Offsets = {}
    let left = 0
    for (const th of heads) {
      if (th.dataset.pinned !== 'left') continue
      next[th.dataset.columnId as string] = { left }
      left += th.getBoundingClientRect().width
    }
    let right = 0
    for (const th of heads.reverse()) {
      if (th.dataset.pinned !== 'right') continue
      next[th.dataset.columnId as string] = { right }
      right += th.getBoundingClientRect().width
    }
    setOffsets((old) => (JSON.stringify(old) === JSON.stringify(next) ? old : next))
  }, [tableRef])

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-measure when pinning or sizes change
  useLayoutEffect(() => {
    measure()
  }, [measure, key])

  useEffect(() => {
    const table = tableRef.current
    if (!key || !table || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => measure())
    observer.observe(table)
    return () => observer.disconnect()
  }, [tableRef, key, measure])

  return offsets
}

/**
 * A table with search, filters, sorting, pagination, selection, bulk actions and column
 * controls, in client or server mode, with loading, empty, no-results and error states.
 * Columns are typed from your row type.
 */
export function DataTable<T>(inProps: DataTableProps<T>) {
  const [props, slots] = useComponentConfig('DataTable', inProps)
  const {
    data,
    columns,
    mode = 'client',
    rowCount,
    hasNextPage,
    onLoadMore,
    loading = false,
    error,
    onRetry,
    getRowId,
    state: stateProp,
    defaultState,
    onStateChange,
    onSortingChange,
    onPaginationChange,
    onSearchChange,
    onColumnFiltersChange,
    pageSize: pageSizeProp = 10,
    pageSizeOptions = DEFAULT_PAGE_SIZES,
    initialSorting,
    selectable = false,
    getRowCanSelect,
    onSelectionChange,
    bulkActions,
    search = false,
    toolbar,
    columnControls,
    densityToggle = false,
    exportCsv,
    onRowClick,
    getRowHref,
    renderSubRow,
    getRowCanExpand,
    onCellEdit,
    maxHeight,
    mobile = 'scroll',
    virtualize,
    empty,
    variant,
    density: densityProp,
    className,
    'aria-label': ariaLabel,
  } = props

  const server = mode === 'server'
  const paginated = pageSizeProp !== false && !onLoadMore
  const controls = resolveControls(columnControls)
  const idPrefix = useId()
  const s = dataTableStyles({ variant })
  const { animate } = useMotionSettings()
  const Link = useLinkComponent()
  const narrow = useMediaQuery('(max-width: 639px)')

  // Per-slice callbacks ride on the single onStateChange.
  const callbacks = useRef({
    onStateChange,
    onSortingChange,
    onPaginationChange,
    onSearchChange,
    onColumnFiltersChange,
  })
  callbacks.current = {
    onStateChange,
    onSortingChange,
    onPaginationChange,
    onSearchChange,
    onColumnFiltersChange,
  }
  const handleStateChange = useCallback((next: DataTableState, changed: DataTableStateKey) => {
    const c = callbacks.current
    c.onStateChange?.(next, changed)
    if (changed === 'sorting') c.onSortingChange?.(next.sorting)
    if (changed === 'pagination') c.onPaginationChange?.(next.pagination)
    if (changed === 'search') c.onSearchChange?.(next.search)
    if (changed === 'columnFilters') c.onColumnFiltersChange?.(next.columnFilters)
  }, [])

  const [state, setState] = useTableState({
    state: stateProp,
    defaultState: {
      ...(typeof pageSizeProp === 'number' && {
        pagination: { pageIndex: 0, pageSize: pageSizeProp },
      }),
      ...(initialSorting && { sorting: initialSorting }),
      ...(densityProp && { density: densityProp as Density }),
      ...defaultState,
    },
    onStateChange: handleStateChange,
  })

  // Changing what matches goes back to page one and ends "select all matching".
  const resetPage = useCallback(() => {
    setState('pagination', (old) => (old.pageIndex === 0 ? old : { ...old, pageIndex: 0 }))
    setState('allMatchingSelected', false)
  }, [setState])
  const setSearch = useCallback(
    (updater: Updater<string>) => {
      setState('search', updater)
      resetPage()
    },
    [setState, resetPage],
  )

  // Cell edits waiting on onCellEdit, saved, or rolled back.
  const [edits, setEdits] = useState<Record<string, CellEditState>>({})
  const onCellEditRef = useRef(onCellEdit)
  onCellEditRef.current = onCellEdit
  const rowsById = useRef(new Map<string, T>())
  // biome-ignore lint/correctness/useExhaustiveDependencies: new data from the parent supersedes saved edits
  useEffect(() => {
    setEdits((old) => {
      const kept = Object.entries(old).filter(([, edit]) => edit.status === 'saving')
      return kept.length === Object.keys(old).length ? old : Object.fromEntries(kept)
    })
  }, [data])
  const glyphMeta = useMemo<GlyphTableMeta>(
    () => ({
      getEdit: (rowId, columnId) => edits[`${rowId}\u0000${columnId}`],
      commitEdit: (rowId, columnId, value, previous) => {
        const key = `${rowId}\u0000${columnId}`
        setEdits((old) => ({ ...old, [key]: { value, status: 'saving' } }))
        const row = rowsById.current.get(rowId) as T
        Promise.resolve()
          .then(() => onCellEditRef.current?.({ row, rowId, columnId, value, previous }))
          .then(
            () => setEdits((old) => ({ ...old, [key]: { value, status: 'saved' } })),
            (reason: unknown) =>
              setEdits((old) => ({
                ...old,
                [key]: {
                  value: previous,
                  status: 'error',
                  error: reason instanceof Error ? reason.message : 'Couldn’t save the change.',
                },
              })),
          )
      },
    }),
    [edits],
  )

  const allColumns = useMemo(
    () => [
      ...(selectable ? [selectColumn<T>()] : []),
      ...(renderSubRow ? [expandColumn<T>(s, idPrefix)] : []),
      ...withFilterFns(columns),
    ],
    [columns, selectable, renderSubRow, s, idPrefix],
  )

  // Sorting and filters can name columns that are gone (an old shared URL, say); TanStack
  // logs an error for each one on every render, so only known columns reach it.
  const knownIds = useMemo(() => leafColumnIds(allColumns), [allColumns])
  const tableSorting = useMemo(
    () =>
      state.sorting.every((sort) => knownIds.has(sort.id))
        ? state.sorting
        : state.sorting.filter((sort) => knownIds.has(sort.id)),
    [state.sorting, knownIds],
  )
  const tableFilters = useMemo(
    () =>
      state.columnFilters.every((filter) => knownIds.has(filter.id))
        ? state.columnFilters
        : state.columnFilters.filter((filter) => knownIds.has(filter.id)),
    [state.columnFilters, knownIds],
  )

  const table = useReactTable<T>({
    data: data ?? NO_ROWS,
    columns: allColumns,
    state: {
      pagination: state.pagination,
      sorting: tableSorting,
      globalFilter: state.search,
      columnFilters: tableFilters,
      columnVisibility: state.columnVisibility,
      columnSizing: state.columnSizing,
      columnPinning: state.columnPinning,
      columnOrder: state.columnOrder,
      rowSelection: state.rowSelection,
      expanded: state.expanded,
    },
    onPaginationChange: (updater) => setState('pagination', updater),
    onSortingChange: (updater) => {
      setState('sorting', updater)
      resetPage()
    },
    onGlobalFilterChange: setSearch,
    onColumnFiltersChange: (updater) => {
      setState('columnFilters', updater)
      resetPage()
    },
    onColumnVisibilityChange: (updater) => setState('columnVisibility', updater),
    onColumnSizingChange: (updater) => setState('columnSizing', updater),
    onColumnPinningChange: (updater) => setState('columnPinning', updater),
    onColumnOrderChange: (updater) => setState('columnOrder', updater),
    onRowSelectionChange: (updater) => {
      let deselected = false
      setState('rowSelection', (old) => {
        const next = typeof updater === 'function' ? updater(old) : updater
        deselected = Object.keys(old).some((id) => old[id] && !next[id])
        return next
      })
      // Unchecking any row ends "select all matching".
      if (deselected) setState('allMatchingSelected', false)
    },
    onExpandedChange: (updater) => setState('expanded', updater),
    meta: { glyph: glyphMeta },
    manualPagination: server,
    manualSorting: server,
    manualFiltering: server,
    ...(server && rowCount !== undefined && { rowCount }),
    ...(server && rowCount === undefined && { pageCount: -1 }),
    autoResetPageIndex: false,
    autoResetExpanded: false,
    enableRowSelection: getRowCanSelect ? (row) => getRowCanSelect(row.original) : selectable,
    enableMultiSort: true,
    isMultiSortEvent: (event) => (event as { shiftKey?: boolean }).shiftKey === true,
    sortDescFirst: false,
    enableColumnResizing: controls.resize,
    columnResizeMode: 'onChange',
    enableColumnPinning: controls.pin,
    getRowCanExpand: (row) =>
      renderSubRow ? (getRowCanExpand ? getRowCanExpand(row.original) : true) : false,
    getCoreRowModel: getCoreRowModel(),
    ...(!server && {
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getFacetedRowModel: getFacetedRowModel(),
    }),
    ...(!server && paginated && { getPaginationRowModel: getPaginationRowModel() }),
    ...(getRowId && { getRowId }),
  })

  const rows = table.getRowModel().rows
  // Remember rows by id: server mode keeps selections from pages no longer loaded.
  if (server) for (const row of rows) rowsById.current.set(row.id, row.original)
  else
    for (const [id, row] of Object.entries(table.getCoreRowModel().rowsById))
      rowsById.current.set(id, row.original)

  // Client data changed: drop selections of rows that are gone and stay on a real page.
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs when the rows change
  useEffect(() => {
    if (server) return
    const ids = table.getCoreRowModel().rowsById
    if (getRowId && Object.keys(state.rowSelection).some((id) => !(id in ids))) {
      setState('rowSelection', (old) =>
        Object.fromEntries(Object.entries(old).filter(([id]) => id in ids)),
      )
    }
    for (const id of [...rowsById.current.keys()]) if (!(id in ids)) rowsById.current.delete(id)
    if (paginated) {
      const pages = table.getPageCount()
      if (pages > 0 && state.pagination.pageIndex >= pages)
        setState('pagination', (old) => ({ ...old, pageIndex: pages - 1 }))
    }
  }, [data])

  // Server data changed: if the total no longer reaches this page, go to the last one.
  useEffect(() => {
    if (!server || !paginated || rowCount === undefined) return
    const pages = Math.max(1, Math.ceil(rowCount / state.pagination.pageSize))
    if (state.pagination.pageIndex >= pages)
      setState('pagination', (old) => ({ ...old, pageIndex: pages - 1 }))
  }, [server, paginated, rowCount, state.pagination.pageIndex, state.pagination.pageSize, setState])

  const selectedIds = useMemo(
    () => Object.keys(state.rowSelection).filter((id) => state.rowSelection[id]),
    [state.rowSelection],
  )
  const selectedRows = selectedIds
    .map((id) => rowsById.current.get(id))
    .filter((row): row is T => row !== undefined)

  // biome-ignore lint/correctness/useExhaustiveDependencies: report only when the selection changes
  useEffect(() => {
    onSelectionChange?.(selectedRows)
  }, [state.rowSelection])

  const pageRows = rows
  const allOnPageSelected =
    pageRows.length > 0 && pageRows.every((row) => !row.getCanSelect() || row.getIsSelected())
  // While "all matching" is on, rows that arrive later (the next server page, new client
  // rows) are selected too, so moving between pages keeps it.
  const rowKey = rows.map((row) => row.id).join('\u0000')
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs when the rows on screen change
  useEffect(() => {
    if (!state.allMatchingSelected) return
    const candidates = server ? rows : table.getFilteredRowModel().rows
    const missing = candidates.filter((row) => row.getCanSelect() && !state.rowSelection[row.id])
    if (missing.length === 0) return
    setState('rowSelection', (old) => {
      const next = { ...old }
      for (const row of missing) next[row.id] = true
      return next
    })
  }, [state.allMatchingSelected, rowKey])

  const total = server ? rowCount : table.getFilteredRowModel().rows.length
  const matchingCount = total ?? selectedIds.length
  const selectedCount = state.allMatchingSelected ? matchingCount : selectedIds.length
  const clearSelection = () => {
    setState('allMatchingSelected', false)
    table.resetRowSelection(true)
  }
  const selection: TableSelection<T> = {
    rows: selectedRows,
    ids: selectedIds,
    count: selectedCount,
    allMatching: state.allMatchingSelected,
    clear: clearSelection,
  }

  // Columns: widths while resizing, measured sticky offsets while pinned.
  const tableRef = useRef<HTMLTableElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const { left: pinnedLeft = [], right: pinnedRight = [] } = state.columnPinning
  const anyPinned = pinnedLeft.length + pinnedRight.length > 0
  const pinKey = anyPinned
    ? `${pinnedLeft.join()}|${pinnedRight.join()}|${JSON.stringify(state.columnSizing)}|${state.density}`
    : ''
  const offsets = usePinnedOffsets(tableRef, pinKey)
  const [scrolled, setScrolled] = useState({ start: false, end: false })
  const onScroll = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    const next = {
      start: el.scrollLeft > 0,
      end: el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
    }
    setScrolled((old) => (old.start === next.start && old.end === next.end ? old : next))
  }, [])
  // biome-ignore lint/correctness/useExhaustiveDependencies: check for overflow when columns change
  useLayoutEffect(() => {
    if (anyPinned) onScroll()
  }, [onScroll, pinKey, state.columnVisibility, data])

  const visibleLeaves = table.getVisibleLeafColumns()
  const lastLeafId = visibleLeaves.at(-1)?.id
  const pinStyle = (columnId: string): CSSProperties | undefined => {
    const offset = offsets[columnId]
    if (!offset) return undefined
    return offset.left !== undefined ? { left: offset.left } : { right: offset.right ?? 0 }
  }
  const pinClass = (columnId: string) => {
    const column = table.getColumn(columnId)
    const pinned = column?.getIsPinned()
    if (!column || !pinned) return undefined
    const edge =
      pinned === 'left'
        ? column.getIsLastColumn('left') && s.pinnedEdgeLeft({ class: slots.pinnedEdgeLeft })
        : column.getIsFirstColumn('right') && s.pinnedEdgeRight({ class: slots.pinnedEdgeRight })
    return cn(s.pinned({ class: slots.pinned }), edge)
  }
  const pinScrolled = (columnId: string) => {
    const pinned = table.getColumn(columnId)?.getIsPinned()
    return pinned === 'left' ? scrolled.start : pinned === 'right' ? scrolled.end : undefined
  }

  // Reordering by drag (or "Move left / right" in the column menu).
  const [dragging, setDragging] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<string | null>(null)
  const moveColumn = (id: string, target: string | -1 | 1) => {
    const order = state.columnOrder.length
      ? [
          ...state.columnOrder,
          ...table
            .getAllLeafColumns()
            .map((c) => c.id)
            .filter((c) => !state.columnOrder.includes(c)),
        ]
      : table.getAllLeafColumns().map((c) => c.id)
    let to = target
    if (typeof target === 'number') {
      // Step over hidden columns so a move is always visible.
      const visible = visibleLeaves.map((c) => c.id)
      const neighbor = visible[visible.indexOf(id) + target]
      if (!neighbor || INTERNAL_COLUMNS.has(neighbor)) return
      to = neighbor
    }
    table.setColumnOrder(moveInOrder(order, id, to as string))
  }

  const density = state.density
  const dens = densityClasses[density]
  const sorting = state.sorting
  const columnCount = visibleLeaves.length
  const hasFilters = table.getAllLeafColumns().some((c) => c.columnDef.meta?.filter)
  const showToolbar = Boolean(
    search || toolbar || hasFilters || controls.hide || densityToggle || exportCsv,
  )
  const scrolls = maxHeight !== undefined || Boolean(virtualize)

  // Rows as links or click targets.
  const linkColumnId = visibleLeaves.find((c) => !INTERNAL_COLUMNS.has(c.id))?.id
  const clickable = Boolean(onRowClick || getRowHref)
  const onRowActivate = (row: Row<T>) => (event: MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement
    // React bubbles events out of portals (a row's menu, a dialog it opened) through the
    // component tree; only clicks inside the row itself count.
    if (!event.currentTarget.contains(target)) return
    const interactive = target.closest(INTERACTIVE)
    if (
      interactive &&
      interactive !== event.currentTarget &&
      event.currentTarget.contains(interactive)
    )
      return
    if (typeof window !== 'undefined' && window.getSelection()?.toString()) return
    if (getRowHref) {
      if (event.metaKey || event.ctrlKey)
        window.open(getRowHref(row.original), '_blank', 'noopener')
      else event.currentTarget.querySelector<HTMLAnchorElement>('a[data-row-link]')?.click()
    }
    onRowClick?.(row.original, event)
  }
  const renderCellContent = (cell: Cell<T, unknown>, row: Row<T>) => {
    const content = flexRender(cell.column.columnDef.cell, cell.getContext())
    if (getRowHref && cell.column.id === linkColumnId) {
      return (
        <Link
          href={getRowHref(row.original)}
          className={s.rowLink({ class: slots.rowLink })}
          data-row-link=""
        >
          {content}
        </Link>
      )
    }
    return content
  }

  const renderRow = (row: Row<T>, measure?: (el: Element | null) => void, index?: number) => {
    const open = Boolean(renderSubRow && row.getIsExpanded())
    return [
      <TableRow
        key={row.id}
        ref={measure}
        data-index={index}
        data-state={row.getIsSelected() ? 'selected' : undefined}
        aria-rowindex={index !== undefined ? index + 2 : undefined}
        className={cn(
          s.row({ class: slots.row }),
          clickable && s.clickableRow({ class: slots.clickableRow }),
        )}
        {...(clickable && { onClick: onRowActivate(row) })}
        {...(onRowClick &&
          !getRowHref && {
            tabIndex: 0,
            onKeyDown: (event) => {
              if (event.key !== 'Enter' || event.target !== event.currentTarget) return
              // Without this, a dialog the handler opens gets Enter's default "click" on its
              // newly focused close button and shuts at once.
              event.preventDefault()
              onRowClick(row.original, event as unknown as MouseEvent<HTMLElement>)
            },
          })}
      >
        {row.getVisibleCells().map((cell) => {
          const meta = cell.column.columnDef.meta
          return (
            <TableCell
              key={cell.id}
              style={pinStyle(cell.column.id)}
              data-scrolled={pinScrolled(cell.column.id)}
              className={cn(
                dens.cell,
                alignClass[meta?.align ?? 'left'],
                meta?.className,
                pinClass(cell.column.id),
              )}
            >
              {renderCellContent(cell, row)}
            </TableCell>
          )
        })}
      </TableRow>,
      renderSubRow ? (
        <SubRow
          key={`${row.id}-sub`}
          id={`${idPrefix}-sub-${row.id}`}
          open={open}
          animate={animate}
          colSpan={columnCount}
          s={s}
          slots={slots}
        >
          {open ? renderSubRow(row.original) : null}
        </SubRow>
      ) : null,
    ]
  }

  const fullWidthRow = (content: ReactNode) => (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={columnCount} className="p-0">
        {content}
      </TableCell>
    </TableRow>
  )

  const keepRows = server && loading && rows.length > 0
  const skeleton = loading && !keepRows
  let body: ReactNode
  if (skeleton) {
    const count = paginated ? Math.min(state.pagination.pageSize, 8) : 5
    body = Array.from({ length: count }, (_, i) => (
      <TableRow key={i} className="hover:bg-transparent">
        {visibleLeaves.map((column) => (
          <TableCell key={column.id} className={dens.cell}>
            <Skeleton className={INTERNAL_COLUMNS.has(column.id) ? 'size-4' : 'h-4 w-[70%]'} />
          </TableCell>
        ))}
      </TableRow>
    ))
  } else if (error) {
    body = fullWidthRow(<ErrorState error={error} onRetry={onRetry} />)
  } else if (rows.length === 0) {
    const searching = state.search !== ''
    const filtering = state.columnFilters.length > 0
    body = fullWidthRow(
      searching || filtering ? (
        <EmptyState
          icon={<SearchIcon />}
          title={searching ? `No results for “${state.search}”` : 'No rows match these filters'}
          description={
            searching ? 'Check the spelling or try a shorter search.' : 'Try removing a filter.'
          }
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => (searching ? setSearch('') : table.resetColumnFilters(true))}
            >
              {searching ? 'Clear search' : 'Clear filters'}
            </Button>
          }
        />
      ) : (
        (empty ?? <EmptyState title="No rows yet" />)
      ),
    )
  } else if (virtualize) {
    body = (
      <VirtualRows
        virtualizer={virtualize}
        rows={rows}
        columnCount={columnCount}
        density={density}
        getScrollElement={() => scrollerRef.current}
        getTableElement={() => tableRef.current}
        renderRow={renderRow}
      />
    )
  } else {
    body = rows.flatMap((row) => renderRow(row))
  }

  // "Select all 312" once every row on the page is selected.
  const moreThanPage = total !== undefined ? total > pageRows.length : Boolean(hasNextPage)
  const banner =
    selectable && !skeleton && allOnPageSelected && moreThanPage ? (
      <div data-slot="data-table-banner" className={s.banner({ class: slots.banner })}>
        {state.allMatchingSelected ? (
          <>
            <span>
              {total !== undefined
                ? `All ${matchingCount.toLocaleString()} rows are selected.`
                : 'All matching rows are selected.'}
            </span>
            <Button variant="link" size="sm" className="h-auto p-0" onClick={clearSelection}>
              Clear selection
            </Button>
          </>
        ) : (
          <>
            <span>All {pageRows.length} rows on this page are selected.</span>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0"
              onClick={() => {
                if (!server) table.toggleAllRowsSelected(true)
                setState('allMatchingSelected', true)
              }}
            >
              {total !== undefined
                ? `Select all ${matchingCount.toLocaleString()}`
                : 'Select all matching'}
            </Button>
          </>
        )}
      </div>
    ) : null

  const showFooter = paginated && !error && !skeleton && (total === undefined || total > 0)
  const asCards = mobile === 'cards' && narrow
  const resizing = controls.resize

  return (
    <div
      data-slot="data-table"
      data-density={density}
      className={s.root({ class: [slots.root, className] })}
    >
      {showToolbar && (
        <div className={s.toolbar({ class: slots.toolbar })}>
          {search && (
            <Input
              size="sm"
              type="search"
              aria-label="Search rows"
              placeholder={(typeof search === 'object' && search.placeholder) || 'Search…'}
              prefix={<SearchIcon />}
              value={state.search}
              onChange={(event) => setSearch(event.target.value)}
              className={s.search({ class: slots.search })}
            />
          )}
          {hasFilters && (
            <div className={s.filters({ class: slots.filters })}>
              <FilterBar table={table} countFacets={!server} />
            </div>
          )}
          {(toolbar || controls.hide || densityToggle || exportCsv) && (
            <div className={s.actions({ class: slots.actions })}>
              {toolbar}
              <TableToolbarMenus
                table={table}
                controls={controls}
                densityToggle={densityToggle}
                density={density}
                onDensityChange={(value) => setState('density', value)}
                exportCsv={exportCsv}
                columns={columns}
                server={server}
                selectedRows={selectedRows}
              />
            </div>
          )}
        </div>
      )}

      <div aria-live="polite">{banner}</div>

      {asCards ? (
        <MobileCards
          table={table}
          rows={rows}
          s={s}
          slots={slots}
          loading={skeleton}
          body={error || rows.length === 0 ? body : null}
          renderCellContent={renderCellContent}
          getRowHref={getRowHref}
          onRowClick={clickable ? onRowActivate : undefined}
          renderSubRow={renderSubRow}
          idPrefix={idPrefix}
        />
      ) : (
        <div
          ref={scrollerRef}
          onScroll={anyPinned ? onScroll : undefined}
          data-slot="data-table-scroller"
          className={s.scroller({ class: slots.scroller })}
          style={scrolls ? { maxHeight: maxHeight ?? virtualize?.height ?? 480 } : undefined}
        >
          {keepRows && (
            <div className={s.progress({ class: slots.progress })} aria-hidden="true">
              <div className={s.progressBar({ class: slots.progressBar })} />
            </div>
          )}
          <table
            ref={tableRef}
            data-slot="table"
            aria-label={ariaLabel}
            aria-busy={loading || undefined}
            aria-rowcount={virtualize ? rows.length + 1 : undefined}
            className={s.table({ class: [slots.table, resizing && 'table-fixed'] })}
            style={resizing ? { width: table.getTotalSize(), minWidth: '100%' } : undefined}
          >
            <TableHeader>
              {table.getHeaderGroups().map((group) => (
                <TableRow key={group.id} className="hover:bg-transparent">
                  {group.headers.map((header) => {
                    const sortAt = sorting.findIndex((sort) => sort.id === header.column.id)
                    return (
                      <HeaderCell
                        key={header.id}
                        header={header}
                        table={table}
                        controls={controls}
                        s={s}
                        slots={slots}
                        headClass={cn(dens.head, scrolls && 'sticky top-0 z-[2]')}
                        width={
                          resizing && header.column.id !== lastLeafId ? header.getSize() : undefined
                        }
                        pinStyle={pinStyle(header.column.id)}
                        pinClass={pinClass(header.column.id)}
                        scrolled={pinScrolled(header.column.id)}
                        sortIndex={sorting.length > 1 && sortAt !== -1 ? sortAt + 1 : undefined}
                        primarySort={sortAt === 0}
                        dragging={dragging}
                        dropTarget={dropTarget}
                        onDragStart={setDragging}
                        onDragOver={setDropTarget}
                        onDrop={(target) => {
                          if (dragging && dragging !== target) moveColumn(dragging, target)
                          setDragging(null)
                          setDropTarget(null)
                        }}
                        onDragEnd={() => {
                          setDragging(null)
                          setDropTarget(null)
                        }}
                        onMove={moveColumn}
                      />
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>{body}</TableBody>
          </table>
        </div>
      )}

      {bulkActions && selectable && (
        <BulkBar
          count={selectedCount}
          allMatching={state.allMatchingSelected}
          onClear={clearSelection}
          s={s}
          slots={slots}
        >
          {selectedCount > 0 ? bulkActions(selection) : null}
        </BulkBar>
      )}

      {onLoadMore && !error && rows.length > 0 && (
        <div className={s.loadMore({ class: slots.loadMore })}>
          <Button
            variant="ghost"
            size="sm"
            loading={loading}
            disabled={hasNextPage === false}
            onClick={onLoadMore}
          >
            {hasNextPage === false ? 'All rows loaded' : 'Load more'}
          </Button>
        </div>
      )}

      {showFooter && (
        <TableFooter
          table={table}
          s={s}
          slots={slots}
          total={total}
          hasNextPage={hasNextPage}
          pageSizeOptions={pageSizeOptions}
          selectedCount={selectedCount}
        />
      )}
    </div>
  )
}

/** The detail row under an expanded row; opens and closes with a height animation. */
function SubRow({
  id,
  open,
  animate,
  colSpan,
  children,
  s,
  slots,
}: {
  id: string
  open: boolean
  animate: boolean
  colSpan: number
  children: ReactNode
  s: Styles
  slots: Slots
}) {
  const row = (
    <tr id={id} data-slot="data-table-sub-row" className={s.subRow({ class: slots.subRow })}>
      <td colSpan={colSpan} className={s.subRowCell({ class: slots.subRowCell })}>
        {animate ? (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.16 } }}
            className="overflow-hidden"
          >
            {children}
          </m.div>
        ) : (
          children
        )}
      </td>
    </tr>
  )
  if (!animate) return open ? row : null
  return <AnimatePresence initial={false}>{open && row}</AnimatePresence>
}
