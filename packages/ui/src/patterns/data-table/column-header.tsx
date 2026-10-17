import { flexRender, type Header, type Table } from '@tanstack/react-table'
import type { CSSProperties, KeyboardEvent } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/dropdown-menu'
import { TableHead } from '../../components/table'
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon, XIcon } from '../../internal/icons'
import { cn } from '../../utils/cn'
import type { dataTableStyles } from './data-table.styles'
import { columnLabel } from './export'
import { ArrowLeftIcon, ArrowRightIcon, EyeOffIcon, MoreIcon, PinIcon, UnpinIcon } from './icons'

export interface ColumnControls {
  hide: boolean
  resize: boolean
  pin: boolean
  reorder: boolean
}

export const INTERNAL_COLUMNS = new Set(['__select', '__expand'])

const alignClass = { left: 'text-left', center: 'text-center', right: 'text-right' } as const

type Styles = ReturnType<typeof dataTableStyles>
type Slots = Partial<Record<string, string>>

export interface HeaderCellProps<T> {
  header: Header<T, unknown>
  table: Table<T>
  controls: ColumnControls
  s: Styles
  slots: Slots
  headClass: string
  /** Explicit width (resizing on). Undefined lets the column absorb leftover space. */
  width: number | undefined
  pinStyle: CSSProperties | undefined
  pinClass: string | undefined
  /** A pinned column has content scrolled under it (shows its edge shadow). */
  scrolled: boolean | undefined
  /** Index of this column in a multi-column sort, from 1. */
  sortIndex: number | undefined
  primarySort: boolean
  dragging: string | null
  dropTarget: string | null
  onDragStart: (id: string) => void
  onDragOver: (id: string) => void
  onDrop: (id: string) => void
  onDragEnd: () => void
  onMove: (id: string, delta: -1 | 1) => void
}

/** A header cell: sort button, priority badge, column menu and resize handle. */
export function HeaderCell<T>({
  header,
  table,
  controls,
  s,
  slots,
  headClass,
  width,
  pinStyle,
  pinClass,
  scrolled,
  sortIndex,
  primarySort,
  dragging,
  dropTarget,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onMove,
}: HeaderCellProps<T>) {
  const column = header.column
  const internal = INTERNAL_COLUMNS.has(column.id)
  const sorted = column.getIsSorted()
  const align = column.columnDef.meta?.align ?? 'left'
  const label = header.isPlaceholder
    ? null
    : flexRender(column.columnDef.header, header.getContext())
  const name = columnLabel(column)
  const pinned = column.getIsPinned()
  const canHide = controls.hide && column.getCanHide() && !internal
  const canPin = controls.pin && column.getCanPin() && !internal
  const canMove = controls.reorder && !internal && !pinned
  const canResize = controls.resize && column.getCanResize() && !internal
  // The column menu comes with column controls; sorting alone keeps the plain header.
  const hasMenu =
    !header.isPlaceholder && !internal && (canHide || canPin || canMove || controls.resize)

  const style: CSSProperties = { ...pinStyle, ...(width !== undefined && { width }) }

  const onResizeKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 48 : 16
    const delta = event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      column.resetSize()
      return
    }
    if (!delta) return
    event.preventDefault()
    const min = column.columnDef.minSize ?? 60
    const max = column.columnDef.maxSize ?? 1000
    const next = Math.min(max, Math.max(min, column.getSize() + delta))
    table.setColumnSizing((old) => ({ ...old, [column.id]: next }))
  }

  return (
    <TableHead
      data-column-id={column.id}
      data-pinned={pinned || undefined}
      data-scrolled={scrolled}
      colSpan={header.colSpan}
      style={style}
      className={cn(
        s.head({ class: slots.head }),
        headClass,
        alignClass[align],
        pinClass,
        pinned && 'z-[3]',
        dropTarget === column.id && dragging !== column.id && s.dropIndicator(),
        dragging === column.id && 'opacity-50',
      )}
      aria-sort={
        primarySort
          ? sorted === 'asc'
            ? 'ascending'
            : sorted === 'desc'
              ? 'descending'
              : undefined
          : undefined
      }
      {...(canMove && {
        draggable: true,
        onDragStart: (event) => {
          // Dragging the resize handle resizes; it must not start a column move.
          if (table.getState().columnSizingInfo.isResizingColumn) {
            event.preventDefault()
            return
          }
          event.dataTransfer.effectAllowed = 'move'
          event.dataTransfer.setData('text/plain', column.id)
          onDragStart(column.id)
        },
        onDragEnd,
      })}
      {...(dragging &&
        canMove && {
          onDragOver: (event) => {
            event.preventDefault()
            event.dataTransfer.dropEffect = 'move'
            onDragOver(column.id)
          },
          onDrop: (event) => {
            event.preventDefault()
            onDrop(column.id)
          },
        })}
    >
      <div
        className={cn(
          s.headInner(),
          align === 'right' && 'flex-row-reverse',
          align === 'center' && 'justify-center',
        )}
      >
        {column.getCanSort() && !header.isPlaceholder ? (
          <button
            type="button"
            onClick={column.getToggleSortingHandler()}
            title={
              column.getCanMultiSort() ? 'Shift-click to sort by more than one column' : undefined
            }
            className={s.sortButton({
              class: [slots.sortButton, align === 'right' && 'flex-row-reverse'],
            })}
          >
            <span className="truncate">{label}</span>
            {sorted === 'asc' ? (
              <ArrowUpIcon />
            ) : sorted === 'desc' ? (
              <ArrowDownIcon />
            ) : (
              <ChevronsUpDownIcon className="opacity-40" />
            )}
            {sortIndex !== undefined && (
              <span className={s.sortIndex()}>
                <span className="sr-only">, sort priority </span>
                {sortIndex}
              </span>
            )}
          </button>
        ) : (
          label
        )}
        {hasMenu && (
          <DropdownMenu>
            <DropdownMenuTrigger
              className={s.headerMenu({ class: slots.headerMenu })}
              aria-label={`${name} column options`}
            >
              <MoreIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align={align === 'right' ? 'end' : 'start'}>
              {column.getCanSort() && (
                <>
                  <DropdownMenuItem
                    icon={<ArrowUpIcon />}
                    onSelect={() => column.toggleSorting(false)}
                  >
                    Sort ascending
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    icon={<ArrowDownIcon />}
                    onSelect={() => column.toggleSorting(true)}
                  >
                    Sort descending
                  </DropdownMenuItem>
                  {sorted && (
                    <DropdownMenuItem icon={<XIcon />} onSelect={() => column.clearSorting()}>
                      Clear sort
                    </DropdownMenuItem>
                  )}
                </>
              )}
              {canPin && (
                <>
                  <DropdownMenuSeparator />
                  {pinned !== 'left' && (
                    <DropdownMenuItem icon={<PinIcon />} onSelect={() => column.pin('left')}>
                      Pin to left
                    </DropdownMenuItem>
                  )}
                  {pinned !== 'right' && (
                    <DropdownMenuItem icon={<PinIcon />} onSelect={() => column.pin('right')}>
                      Pin to right
                    </DropdownMenuItem>
                  )}
                  {pinned && (
                    <DropdownMenuItem icon={<UnpinIcon />} onSelect={() => column.pin(false)}>
                      Unpin
                    </DropdownMenuItem>
                  )}
                </>
              )}
              {canMove && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem icon={<ArrowLeftIcon />} onSelect={() => onMove(column.id, -1)}>
                    Move left
                  </DropdownMenuItem>
                  <DropdownMenuItem icon={<ArrowRightIcon />} onSelect={() => onMove(column.id, 1)}>
                    Move right
                  </DropdownMenuItem>
                </>
              )}
              {canHide && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    icon={<EyeOffIcon />}
                    onSelect={() => column.toggleVisibility(false)}
                  >
                    Hide column
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      {canResize && (
        // biome-ignore lint/a11y/useSemanticElements: a focusable separator is the ARIA pattern for a splitter; <hr> can't take focus or children
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label={`Resize ${name} column`}
          aria-valuenow={column.getSize()}
          aria-valuemin={column.columnDef.minSize ?? 60}
          aria-valuemax={column.columnDef.maxSize ?? 1000}
          tabIndex={0}
          data-resizing={column.getIsResizing()}
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
          onDoubleClick={() => column.resetSize()}
          onKeyDown={onResizeKey}
          onClick={(event) => event.stopPropagation()}
          className={s.resizer({ class: slots.resizer })}
        />
      )}
    </TableHead>
  )
}
