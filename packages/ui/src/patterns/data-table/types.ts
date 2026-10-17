import type {
  ColumnFiltersState,
  ColumnOrderState,
  ColumnPinningState,
  ColumnSizingState,
  ExpandedState,
  PaginationState,
  RowData,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table'
import type { ReactNode } from 'react'

/** One choice in a `select` or `multi` column filter. */
export interface FilterOption {
  value: string
  label: string
  icon?: ReactNode
  /** Shown beside the option. In client mode Glyph counts matching rows itself. */
  count?: number
}

/**
 * A filter declared on a column with `meta: { filter }`. Filtered columns get a chip in the
 * toolbar's Filter menu. Values are stored in `columnFilters` as plain, URL-safe data:
 *
 * - `select`: one string
 * - `multi`: an array of strings (a single string also matches)
 * - `range`: `{ min?: number, max?: number }`
 * - `date-range`: `{ from?: string, to?: string }` as `yyyy-mm-dd`
 * - `text`: a string matched case-insensitively
 */
export type ColumnFilterConfig =
  | { type: 'select'; options: readonly FilterOption[] }
  | { type: 'multi'; options: readonly FilterOption[] }
  | {
      type: 'range'
      min?: number
      max?: number
      step?: number
      /** Formats bounds in the chip, e.g. as currency. */
      format?: (value: number) => string
    }
  | {
      type: 'date-range'
      /** Quick picks in the editor, e.g. "Last 30 days". */
      presets?: readonly { label: string; range: () => { from: Date; to: Date } }[]
    }
  | { type: 'text'; placeholder?: string }

export type FilterType = ColumnFilterConfig['type']

/** Filter values as stored in `columnFilters`, by filter type. */
export interface RangeFilterValue {
  min?: number | undefined
  max?: number | undefined
}
export interface DateRangeFilterValue {
  from?: string | undefined
  to?: string | undefined
}

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Cell and header alignment. Use `right` for numbers. */
    align?: 'left' | 'center' | 'right'
    /** Extra classes for this column's cells. */
    className?: string
    /**
     * Plain-text name of the column, used in menus, filter chips, mobile cards and CSV
     * headers. Defaults to the header when it is a string, otherwise the column id.
     */
    label?: string
    /** Adds a filter for this column to the toolbar. */
    filter?: ColumnFilterConfig
    /**
     * In mobile card layout: `title` leads the card, `hidden` leaves the column out.
     * The first data column is the title by default.
     */
    mobile?: 'title' | 'hidden'
    /** CSV value for this column, or `false` to leave it out of exports. */
    csv?: false | ((value: TValue, row: TData) => unknown)
  }
}

export type Density = 'compact' | 'default' | 'comfortable'

/** Everything a DataTable remembers. Each slice can be controlled or left to the table. */
export interface DataTableState {
  pagination: PaginationState
  sorting: SortingState
  /** The search box. */
  search: string
  columnFilters: ColumnFiltersState
  columnVisibility: VisibilityState
  columnSizing: ColumnSizingState
  columnPinning: ColumnPinningState
  columnOrder: ColumnOrderState
  rowSelection: RowSelectionState
  /**
   * The user chose "Select all" for every row that matches the current search and filters,
   * including rows on other pages. In server mode act on the query, not on `rowSelection`.
   */
  allMatchingSelected: boolean
  expanded: ExpandedState
  density: Density
}

export type DataTableStateKey = keyof DataTableState

/** The selected rows, as passed to `bulkActions`. */
export interface TableSelection<T> {
  /** Selected rows the table has seen. With `allMatching`, rows on unseen pages are missing. */
  rows: T[]
  /** Ids of the selected rows (from `getRowId`). */
  ids: string[]
  /** How many rows are selected, counting every matching row when `allMatching` is set. */
  count: number
  /** Every row that matches the current search and filters is selected. */
  allMatching: boolean
  clear: () => void
}

/** Passed to `onCellEdit` when an editable cell is committed. */
export interface CellEdit<T> {
  row: T
  rowId: string
  columnId: string
  value: unknown
  previous: unknown
}
