import type { CellContext, RowData } from '@tanstack/react-table'
import { type KeyboardEvent, type ReactNode, useId, useRef, useState } from 'react'
import { Input } from '../../components/input'
import { Select, SelectItem } from '../../components/select'
import { cn } from '../../utils/cn'
import { focusRing } from '../../utils/styles'
import { columnLabel } from './export'

/** An edit in flight or rejected, keyed by row and column. */
export interface CellEditState {
  value: unknown
  status: 'saving' | 'saved' | 'error'
  error?: string
}

/** What DataTable gives editable cells through the table's meta. */
export interface GlyphTableMeta {
  getEdit: (rowId: string, columnId: string) => CellEditState | undefined
  commitEdit: (rowId: string, columnId: string, value: unknown, previous: unknown) => void
}

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    /** Set by DataTable for `editableCell()`. */
    glyph?: GlyphTableMeta
  }
}

export interface EditableCellOptions<TValue, TRow = unknown> {
  /** The editor: a text field, a number field, or a choice from `options`. Default `text`. */
  type?: 'text' | 'number' | 'select'
  /** Choices for `type: "select"`. */
  options?: readonly { value: string; label: string }[]
  /** Return an error message to reject a value before it is saved. */
  validate?: (value: TValue, row: TRow) => string | null | undefined
  /** How the value reads when not editing. */
  format?: (value: TValue, row: TRow) => ReactNode
  placeholder?: string
}

function display<TValue, TRow>(
  value: TValue,
  row: TRow,
  options: EditableCellOptions<TValue, TRow>,
): ReactNode {
  if (options.format) return options.format(value, row)
  if (options.type === 'select') {
    return (
      options.options?.find((option) => option.value === String(value))?.label ??
      String(value ?? '')
    )
  }
  return value === null || value === undefined || value === '' ? null : String(value)
}

const trigger = [
  '-mx-1.5 -my-1 flex min-h-7 w-[calc(100%+0.75rem)] cursor-text items-center rounded-xs px-1.5 py-1 text-left hover:bg-muted/70 hover:shadow-[inset_0_0_0_1px_var(--color-border)]',
  focusRing,
  'focus-visible:ring-offset-0',
].join(' ')

function EditableCell<TRow, TValue>({
  ctx,
  options,
}: {
  ctx: CellContext<TRow, TValue>
  options: EditableCellOptions<TValue, TRow>
}) {
  const { row, column, table } = ctx
  const meta = table.options.meta?.glyph
  const edit = meta?.getEdit(row.id, column.id)
  const current = (edit && edit.status !== 'error' ? edit.value : ctx.getValue()) as TValue
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const errorId = useId()
  const label = columnLabel(column)
  const type = options.type ?? 'text'

  const start = () => {
    setDraft(current === null || current === undefined ? '' : String(current))
    setError(null)
    setEditing(true)
  }
  const stop = (refocus: boolean) => {
    setEditing(false)
    setError(null)
    if (refocus) requestAnimationFrame(() => triggerRef.current?.focus())
  }
  const commit = (raw: string, refocus = true) => {
    let value: unknown = raw
    if (type === 'number') {
      value = raw.trim() === '' ? null : Number(raw)
      if (typeof value === 'number' && !Number.isFinite(value)) {
        setError('Enter a number')
        return
      }
    }
    const message = options.validate?.(value as TValue, row.original)
    if (message) {
      setError(message)
      return
    }
    if (!Object.is(value, current)) meta?.commitEdit(row.id, column.id, value, ctx.getValue())
    stop(refocus)
  }

  if (editing && type === 'select') {
    return (
      <Select
        size="sm"
        defaultOpen
        aria-label={label}
        value={draft}
        onValueChange={(value) => commit(value)}
        onOpenChange={(open) => !open && stop(true)}
        className="-my-1 w-full"
      >
        {options.options?.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </Select>
    )
  }

  if (editing) {
    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        commit(draft)
      } else if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        stop(true)
      }
    }
    return (
      <div className="relative -mx-1.5 -my-1">
        <Input
          size="sm"
          autoFocus
          aria-label={label}
          type={type === 'number' ? 'number' : 'text'}
          inputMode={type === 'number' ? 'decimal' : undefined}
          value={draft}
          placeholder={options.placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => {
            setDraft(event.target.value)
            if (error) setError(null)
          }}
          onKeyDown={onKeyDown}
          onBlur={() => commit(draft, false)}
          onFocus={(event) => event.target.select()}
          inputClassName={cn(column.columnDef.meta?.align === 'right' && 'text-right')}
        />
        {error && (
          <p
            id={errorId}
            role="alert"
            className="absolute top-full left-0 z-10 mt-1 whitespace-nowrap rounded-xs bg-danger px-2 py-1 text-caption text-danger-foreground shadow-md"
          >
            {error}
          </p>
        )}
      </div>
    )
  }

  const text = display(current, row.original, options)
  return (
    <span className="relative block">
      <button
        ref={triggerRef}
        type="button"
        onClick={start}
        aria-label={`Edit ${label}`}
        aria-describedby={edit?.status === 'error' ? errorId : undefined}
        data-state={edit?.status}
        className={cn(
          trigger,
          column.columnDef.meta?.align === 'right' && 'justify-end text-right',
          edit?.status === 'saving' && 'opacity-60',
          edit?.status === 'error' && 'shadow-[inset_0_0_0_1px_var(--color-danger)]',
        )}
      >
        {text ?? <span className="text-faint-foreground">{options.placeholder ?? 'Empty'}</span>}
      </button>
      {edit?.status === 'error' && (
        <span id={errorId} role="alert" className="sr-only">
          {edit.error ?? `Couldn’t save ${label}.`}
        </span>
      )}
    </span>
  )
}

/**
 * Makes a column editable in place. Click or press Enter to edit; Enter saves, Escape
 * cancels. DataTable's `onCellEdit` receives the change: the cell shows the new value right
 * away and rolls back if your promise rejects.
 *
 * ```tsx
 * col.accessor('name', { header: 'Name', cell: editableCell({ validate: (v) => !v && 'Required' }) })
 * ```
 */
export function editableCell<TRow, TValue = unknown>(
  options: EditableCellOptions<TValue, TRow> = {},
): (ctx: CellContext<TRow, TValue>) => ReactNode {
  return function EditableCellRenderer(ctx) {
    return <EditableCell ctx={ctx} options={options} />
  }
}
