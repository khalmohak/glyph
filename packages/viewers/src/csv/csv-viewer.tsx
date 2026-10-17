import { cn, Progress, Select, SelectItem, Switch, tv, useComponentConfig } from '@glyphui/ui'
import { useId, useMemo, useState } from 'react'
import { type StylesEntry, ViewerStatus, viewerFrameStyles } from '../internal/frame'
import { readText, sourceName, type ViewerSource } from '../internal/source'
import { useViewersStylesCheck } from '../internal/styles-check'
import { useResource } from '../internal/use-resource'
import { buildTable, looksLikeHeader } from '../table/infer'
import { TableView } from '../table/table-view'
import { type CsvParseResult, delimiterNames, parseCsv, WORKER_THRESHOLD } from './parse'

export const csvViewerStyles = /* @__PURE__ */ tv({
  extend: viewerFrameStyles,
  slots: {
    controls: 'flex items-center gap-2',
    control: 'flex items-center gap-2 text-small whitespace-nowrap text-muted-foreground',
    progress:
      'grid min-h-48 content-center justify-items-center gap-3 p-6 text-small text-muted-foreground',
    errors:
      'border-b border-border bg-warning/8 px-3 py-2 text-small text-warning-text [&_summary]:cursor-pointer',
  },
})

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    CsvViewer: StylesEntry<typeof csvViewerStyles>
  }
}

type DelimiterChoice = 'auto' | ',' | ';' | '\t' | '|'

export interface CsvViewerProps {
  /** The CSV file: a URL, a File/Blob, or bytes. */
  source?: ViewerSource
  /** CSV text, instead of `source`. */
  content?: string
  /** Starting delimiter. Detected by default. */
  delimiter?: string
  /** Whether the first row names the columns. `auto` (default) guesses. */
  header?: boolean | 'auto'
  /** Stops reading after this many rows. Default 1,000,000. */
  maxRows?: number
  /** Name used for the export file and the table label. */
  fileName?: string
  /** Height of the table area. Default 480. */
  height?: number | string
  /** Called after each successful parse. */
  onParsed?: (result: CsvParseResult) => void
  className?: string
}

/**
 * A CSV file as a searchable, sortable, filterable table. Columns are typed (number, date,
 * yes/no, text) from their values; big files parse in a worker and render virtualized.
 * Needs `papaparse`, `@tanstack/react-table` and `@tanstack/react-virtual`.
 */
export function CsvViewer(inProps: CsvViewerProps) {
  const [props, slots] = useComponentConfig('CsvViewer', inProps)
  const {
    source,
    content,
    delimiter: initialDelimiter,
    header: headerProp = 'auto',
    maxRows = 1_000_000,
    fileName,
    height = 480,
    onParsed,
    className,
  } = props
  useViewersStylesCheck()
  // The DataTable draws the card; this wrapper only stacks errors and the summary.
  const s = csvViewerStyles({ bordered: false })
  const id = useId()
  const [delimiter, setDelimiter] = useState<DelimiterChoice>(
    (initialDelimiter as DelimiterChoice | undefined) || 'auto',
  )
  const [headerOverride, setHeaderOverride] = useState<boolean | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const name = fileName ?? sourceName(source) ?? 'data.csv'

  const parsed = useResource(
    async (signal) => {
      setProgress(null)
      let input: string | Blob
      if (content !== undefined) input = content
      else if (typeof Blob !== 'undefined' && source instanceof Blob) input = source
      else if (source !== undefined) input = await readText(source, signal)
      else throw new Error('No CSV to show. Pass `source` or `content`.')
      const size = typeof input === 'string' ? input.length : input.size
      const result = await parseCsv(input, {
        delimiter: delimiter === 'auto' ? '' : delimiter,
        maxRows,
        signal,
        ...(size >= WORKER_THRESHOLD && { onProgress: setProgress }),
      })
      onParsed?.(result)
      return result
    },
    [source, content, delimiter, maxRows],
  )

  const result = parsed.status === 'success' ? parsed.data : undefined
  const autoHeader = useMemo(() => (result ? looksLikeHeader(result.rows) : true), [result])
  const header = headerOverride ?? (headerProp === 'auto' ? autoHeader : headerProp)
  const table = useMemo(
    () => (result ? buildTable(result.rows, header) : undefined),
    [result, header],
  )

  const exportName = name.replace(/\.[^.]+$/, '')
  const controls = (
    <div className={s.controls({ class: slots.controls })}>
      <Select<DelimiterChoice>
        size="sm"
        aria-label="Delimiter"
        value={delimiter}
        onValueChange={setDelimiter}
      >
        <SelectItem value="auto">
          Auto
          {result && delimiter === 'auto'
            ? ` (${delimiterNames[result.delimiter] ?? result.delimiter})`
            : ''}
        </SelectItem>
        <SelectItem value=",">Comma</SelectItem>
        <SelectItem value=";">Semicolon</SelectItem>
        <SelectItem value={'\t'}>Tab</SelectItem>
        <SelectItem value="|">Pipe</SelectItem>
      </Select>
      <label htmlFor={`${id}-header`} className={s.control({ class: slots.control })}>
        <Switch
          id={`${id}-header`}
          size="sm"
          checked={header}
          onCheckedChange={(checked) => setHeaderOverride(checked)}
        />
        Header row
      </label>
    </div>
  )

  return (
    <div data-slot="csv-viewer" className={cn(s.root({ class: slots.root }), 'gap-2', className)}>
      {parsed.status === 'loading' &&
        (progress === null ? (
          <ViewerStatus status="loading" label={`Reading ${name}…`} />
        ) : (
          <div className={s.progress({ class: slots.progress })} role="status">
            <span>
              Reading {name}… {Math.round(progress * 100)}%
            </span>
            <Progress value={progress * 100} className="w-56" aria-label="Reading the file" />
          </div>
        ))}
      {parsed.status === 'error' && (
        <ViewerStatus status="error" error={parsed.error} onRetry={parsed.reload} />
      )}
      {result && table && (
        <>
          {result.errors.length > 0 && (
            <details className={cn(s.errors({ class: slots.errors }), 'rounded-md')}>
              <summary>
                {result.errors.length === 1
                  ? '1 row could not be read cleanly'
                  : `${result.errors.length}${result.errors.length === 100 ? '+' : ''} rows could not be read cleanly`}
              </summary>
              <ul className="mt-1 grid gap-0.5 font-mono text-caption">
                {result.errors.slice(0, 20).map((error) => (
                  <li key={`${error.row}-${error.message}`}>
                    Row {error.row}: {error.message}
                  </li>
                ))}
              </ul>
            </details>
          )}
          <TableView
            data={table}
            label={name}
            toolbar={controls}
            height={height}
            exportName={exportName}
          />
          <p className="px-1 text-caption text-muted-foreground tabular-nums">
            {table.rows.length.toLocaleString()} {table.rows.length === 1 ? 'row' : 'rows'} ·{' '}
            {table.columns.length} {table.columns.length === 1 ? 'column' : 'columns'} ·{' '}
            {(delimiterNames[result.delimiter] ?? result.delimiter).toLowerCase()}-separated
            {result.truncated && ` · showing the first ${maxRows.toLocaleString()} rows`}
          </p>
        </>
      )}
    </div>
  )
}
