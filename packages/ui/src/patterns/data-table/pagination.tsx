import type { Table } from '@tanstack/react-table'
import type { ReactNode } from 'react'
import { IconButton } from '../../components/button'
import { Pagination } from '../../components/pagination'
import { Select, SelectItem } from '../../components/select'
import { ChevronLeftIcon, ChevronRightIcon } from '../../internal/icons'
import type { dataTableStyles } from './data-table.styles'

type Styles = ReturnType<typeof dataTableStyles>

const numberFormat = new Intl.NumberFormat()

export interface TableFooterProps<T> {
  table: Table<T>
  s: Styles
  slots: Partial<Record<string, string>>
  /** Rows across every page. Undefined in cursor mode, where the total is unknown. */
  total: number | undefined
  /** Cursor mode: whether a next page exists. */
  hasNextPage: boolean | undefined
  pageSizeOptions: readonly number[]
  selectedCount: number
}

/** "1–10 of 312 · 3 selected", rows per page, and page navigation. */
export function TableFooter<T>({
  table,
  s,
  slots,
  total,
  hasNextPage,
  pageSizeOptions,
  selectedCount,
}: TableFooterProps<T>) {
  const { pageIndex, pageSize } = table.getState().pagination
  const pageRows = table.getRowModel().rows.length
  const first = pageIndex * pageSize + 1
  const last = pageIndex * pageSize + pageRows
  const cursor = total === undefined
  const pageCount = cursor ? 0 : Math.max(1, Math.ceil(total / pageSize))
  const sizes = pageSizeOptions.includes(pageSize)
    ? pageSizeOptions
    : [...pageSizeOptions, pageSize].sort((a, b) => a - b)

  let range: ReactNode
  if (pageRows === 0) range = 'No rows'
  else if (cursor) range = `${numberFormat.format(first)}–${numberFormat.format(last)}`
  else
    range = `${numberFormat.format(first)}–${numberFormat.format(last)} of ${numberFormat.format(total)}`

  return (
    <div data-slot="data-table-footer" className={s.footer({ class: slots.footer })}>
      <p className={s.footerInfo({ class: slots.footerInfo })}>
        <span>{range}</span>
        {selectedCount > 0 && (
          <span className="text-foreground">· {numberFormat.format(selectedCount)} selected</span>
        )}
      </p>
      <div className={s.pager({ class: slots.pager })}>
        {sizes.length > 1 && (
          <div className={s.pageSize({ class: slots.pageSize })}>
            <span aria-hidden="true">Rows per page</span>
            <Select
              size="sm"
              aria-label="Rows per page"
              value={String(pageSize)}
              onValueChange={(value) => table.setPageSize(Number(value))}
              className="w-[4.5rem]"
            >
              {sizes.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </Select>
          </div>
        )}
        {cursor ? (
          <div className="flex items-center gap-1">
            <span className="mr-2">Page {numberFormat.format(pageIndex + 1)}</span>
            <IconButton
              variant="outline"
              size="sm"
              icon={<ChevronLeftIcon />}
              aria-label="Previous page"
              disabled={pageIndex === 0}
              onClick={() => table.previousPage()}
            />
            <IconButton
              variant="outline"
              size="sm"
              icon={<ChevronRightIcon />}
              aria-label="Next page"
              disabled={!hasNextPage}
              onClick={() => table.setPageIndex(pageIndex + 1)}
            />
          </div>
        ) : (
          <Pagination
            size="sm"
            page={pageIndex + 1}
            pageCount={pageCount}
            showEdges={pageCount > 5}
            onPageChange={(page) => table.setPageIndex(page - 1)}
          />
        )}
      </div>
    </div>
  )
}
