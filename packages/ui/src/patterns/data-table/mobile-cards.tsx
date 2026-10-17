import { type Cell, flexRender, type Row, type Table } from '@tanstack/react-table'
import type { MouseEvent, ReactNode } from 'react'
import { Skeleton } from '../../components/skeleton'
import { ChevronRightIcon } from '../../internal/icons'
import { cn } from '../../utils/cn'
import { INTERNAL_COLUMNS } from './column-header'
import type { dataTableStyles } from './data-table.styles'

type Styles = ReturnType<typeof dataTableStyles>

/**
 * Rows as stacked cards for small screens: the title column leads, other columns follow
 * as label / value pairs, and columns without data (row actions) sit in the corner.
 */
export function MobileCards<T>({
  table,
  rows,
  s,
  slots,
  loading,
  body,
  renderCellContent,
  getRowHref,
  onRowClick,
  renderSubRow,
  idPrefix,
  label,
}: {
  table: Table<T>
  rows: Row<T>[]
  s: Styles
  slots: Partial<Record<string, string>>
  loading: boolean
  /** Loading, empty and error states, rendered in place of cards. */
  body: ReactNode
  renderCellContent: (cell: Cell<T, unknown>, row: Row<T>) => ReactNode
  getRowHref: ((row: T) => string) | undefined
  onRowClick: ((row: Row<T>) => (event: MouseEvent<HTMLElement>) => void) | undefined
  renderSubRow: ((row: T) => ReactNode) | undefined
  idPrefix: string
  /** Accessible name of the card list: the table's `aria-label`. */
  label?: string | undefined
}) {
  if (loading) {
    return (
      <ul
        className={cn(s.cards({ class: slots.cards }), 'p-3')}
        aria-busy="true"
        aria-label="Loading"
      >
        {[0, 1, 2].map((i) => (
          <li key={i} className={s.card({ class: slots.card })}>
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-2/3" />
          </li>
        ))}
      </ul>
    )
  }
  if (body) {
    return (
      <table className="w-full">
        <tbody>{body}</tbody>
      </table>
    )
  }

  const visible = table.getVisibleLeafColumns()
  const titleColumn =
    visible.find((c) => c.columnDef.meta?.mobile === 'title') ??
    visible.find((c) => !INTERNAL_COLUMNS.has(c.id) && c.accessorFn)
  const clickable = Boolean(getRowHref || onRowClick)

  return (
    <ul
      data-slot="data-table-cards"
      aria-label={label}
      className={cn(s.cards({ class: slots.cards }), 'p-3')}
    >
      {rows.map((row) => {
        const cells = row.getVisibleCells()
        const title = cells.find((cell) => cell.column.id === titleColumn?.id)
        const select = cells.find((cell) => cell.column.id === '__select')
        const actions = cells.filter(
          (cell) => !cell.column.accessorFn && !INTERNAL_COLUMNS.has(cell.column.id),
        )
        const fields = cells.filter(
          (cell) =>
            cell !== title &&
            cell.column.accessorFn &&
            cell.column.columnDef.meta?.mobile !== 'hidden',
        )
        const expanded = renderSubRow && row.getIsExpanded()
        return (
          <li
            key={row.id}
            data-state={row.getIsSelected() ? 'selected' : undefined}
            className={cn(s.card({ class: slots.card }), clickable && 'cursor-pointer')}
            {...(onRowClick && { onClick: onRowClick(row) })}
            {...(onRowClick &&
              !getRowHref && {
                tabIndex: 0,
                onKeyDown: (event) => {
                  if (event.key !== 'Enter' || event.target !== event.currentTarget) return
                  event.preventDefault()
                  onRowClick(row)(event as unknown as MouseEvent<HTMLElement>)
                },
              })}
          >
            <div className={s.cardHeader({ class: slots.cardHeader })}>
              {select && flexRender(select.column.columnDef.cell, select.getContext())}
              <div className={s.cardTitle({ class: slots.cardTitle })}>
                {title && renderCellContent(title, row)}
              </div>
              {actions.map((cell) => (
                <div key={cell.id} className="-my-1 shrink-0">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </div>
              ))}
            </div>
            {fields.length > 0 && (
              <dl className={s.cardFields({ class: slots.cardFields })}>
                {fields.map((cell) => {
                  const header = cell.column.columnDef.header
                  const label =
                    cell.column.columnDef.meta?.label ??
                    (typeof header === 'string' ? header : cell.column.id)
                  return (
                    <div key={cell.id} className="contents">
                      <dt className={s.cardLabel({ class: slots.cardLabel })}>{label}</dt>
                      <dd className={s.cardValue({ class: slots.cardValue })}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </dd>
                    </div>
                  )
                })}
              </dl>
            )}
            {renderSubRow && row.getCanExpand() && (
              <button
                type="button"
                className="inline-flex items-center gap-1 justify-self-start text-small text-muted-foreground hover:text-foreground [&>svg]:size-4 [&>svg]:transition-transform aria-expanded:[&>svg]:rotate-90"
                aria-expanded={row.getIsExpanded()}
                aria-controls={expanded ? `${idPrefix}-card-sub-${row.id}` : undefined}
                onClick={row.getToggleExpandedHandler()}
              >
                <ChevronRightIcon />
                {row.getIsExpanded() ? 'Hide details' : 'Show details'}
              </button>
            )}
            {expanded && (
              <div id={`${idPrefix}-card-sub-${row.id}`}>{renderSubRow(row.original)}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
