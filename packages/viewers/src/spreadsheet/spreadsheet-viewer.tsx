import {
  Button,
  cn,
  EmptyState,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  tv,
  useComponentConfig,
} from '@glyphui/ui'
import { useId, useMemo, useState } from 'react'
import { type StylesEntry, ViewerStatus, viewerFrameStyles } from '../internal/frame'
import { TableIcon } from '../internal/icons'
import { formatBytes, readBytes, sourceName, type ViewerSource } from '../internal/source'
import { useViewersStylesCheck } from '../internal/styles-check'
import { useResource } from '../internal/use-resource'
import { buildTable, looksLikeHeader, type RawValue } from '../table/infer'
import { TableView } from '../table/table-view'

export const spreadsheetViewerStyles = /* @__PURE__ */ tv({
  extend: viewerFrameStyles,
  slots: {
    tabs: 'min-w-0',
    tabList: 'max-w-full overflow-x-auto',
    control: 'flex items-center gap-2 text-small whitespace-nowrap text-muted-foreground',
  },
})

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    SpreadsheetViewer: StylesEntry<typeof spreadsheetViewerStyles>
  }
}

export interface SpreadsheetSheet {
  name: string
  rows: RawValue[][]
}

export interface SpreadsheetViewerProps {
  /** An `.xlsx` file: a URL, a File/Blob, or bytes. */
  source: ViewerSource
  /** Sheet to open first, by name or index. Default the first. */
  defaultSheet?: string | number
  /** Whether the first row names the columns. `auto` (default) guesses per sheet. */
  header?: boolean | 'auto'
  /**
   * Files larger than this ask before opening, since the whole workbook is read in memory.
   * Default 20 MB.
   */
  maxBytes?: number
  /** Name used for export files and the table label. */
  fileName?: string
  /** Height of the table area. Default 480. */
  height?: number | string
  className?: string
}

type Loaded = { kind: 'too-large'; size: number } | { kind: 'ready'; sheets: SpreadsheetSheet[] }

async function readWorkbook(bytes: ArrayBuffer): Promise<SpreadsheetSheet[]> {
  const { default: readXlsxFile } = await import('read-excel-file/browser')
  const sheets = await readXlsxFile(new Blob([bytes]))
  return sheets.map((sheet) => ({
    name: sheet.sheet,
    // Merged cells come back as null after their first cell; they show as blanks.
    rows: sheet.data.map((row) => row.map((cell) => cell as RawValue)),
  }))
}

/**
 * An Excel workbook (`.xlsx`) as tabs of searchable, sortable, filterable tables. Reads
 * numbers, dates and booleans with their types. Needs `read-excel-file`,
 * `@tanstack/react-table` and `@tanstack/react-virtual`.
 */
export function SpreadsheetViewer(inProps: SpreadsheetViewerProps) {
  const [props, slots] = useComponentConfig('SpreadsheetViewer', inProps)
  const {
    source,
    defaultSheet = 0,
    header: headerProp = 'auto',
    maxBytes = 20 * 1024 * 1024,
    fileName,
    height = 480,
    className,
  } = props
  useViewersStylesCheck()
  const s = spreadsheetViewerStyles({ bordered: false })
  const id = useId()
  const name = fileName ?? sourceName(source) ?? 'workbook.xlsx'
  const [allowLarge, setAllowLarge] = useState(false)
  // Tabs are keyed by index: sheet names can contain spaces, which ARIA id references can't.
  const [active, setActive] = useState<number | null>(null)
  const [headerOverrides, setHeaderOverrides] = useState<Record<string, boolean>>({})

  const workbook = useResource<Loaded>(
    async (signal) => {
      const bytes = await readBytes(source, signal)
      if (bytes.byteLength > maxBytes && !allowLarge)
        return { kind: 'too-large', size: bytes.byteLength }
      return { kind: 'ready', sheets: await readWorkbook(bytes) }
    },
    [source, maxBytes, allowLarge],
  )

  const sheets =
    workbook.status === 'success' && workbook.data.kind === 'ready' ? workbook.data.sheets : []
  const fallback =
    typeof defaultSheet === 'number'
      ? sheets[defaultSheet]?.name
      : sheets.find((sheet) => sheet.name === defaultSheet)?.name
  const current =
    (active !== null ? sheets[active] : undefined) ??
    sheets.find((sheet) => sheet.name === fallback) ??
    sheets[0]
  const header = current
    ? (headerOverrides[current.name] ??
      (headerProp === 'auto' ? looksLikeHeader(current.rows) : headerProp))
    : true
  const table = useMemo(
    () => (current ? buildTable(current.rows, header) : undefined),
    [current, header],
  )

  if (workbook.status === 'loading')
    return <ViewerStatus status="loading" label={`Opening ${name}…`} />
  if (workbook.status === 'error') {
    return <ViewerStatus status="error" error={workbook.error} onRetry={workbook.reload} />
  }
  if (workbook.data.kind === 'too-large') {
    return (
      <EmptyState
        icon={<TableIcon />}
        title="This workbook is large"
        description={`${name} is ${formatBytes(workbook.data.size)}. Opening it reads the whole file in memory, which can slow the page down.`}
        action={
          <Button size="sm" variant="outline" onClick={() => setAllowLarge(true)}>
            Open anyway
          </Button>
        }
      />
    )
  }

  const index = current ? sheets.indexOf(current) : 0
  const content =
    current && table ? (
      <div className="grid gap-2">
        <TableView
          key={current.name}
          data={table}
          label={`${name}, sheet ${current.name}`}
          height={height}
          exportName={`${name.replace(/\.[^.]+$/, '')}-${current.name}`}
          toolbar={
            <label htmlFor={`${id}-header`} className={s.control({ class: slots.control })}>
              <Switch
                id={`${id}-header`}
                size="sm"
                checked={header}
                onCheckedChange={(checked) =>
                  setHeaderOverrides((all) => ({ ...all, [current.name]: checked }))
                }
              />
              Header row
            </label>
          }
        />
        <p className="px-1 text-caption text-muted-foreground tabular-nums">
          {table.rows.length.toLocaleString()} {table.rows.length === 1 ? 'row' : 'rows'} ·{' '}
          {table.columns.length} {table.columns.length === 1 ? 'column' : 'columns'}
          {sheets.length > 1 && ` · ${sheets.length} sheets`}
        </p>
      </div>
    ) : (
      <EmptyState icon={<TableIcon />} title="This workbook has no sheets" />
    )

  return (
    <div
      data-slot="spreadsheet-viewer"
      className={cn(s.root({ class: slots.root }), 'gap-2', className)}
    >
      {sheets.length > 1 ? (
        <Tabs
          value={String(index)}
          onValueChange={(value) => setActive(Number(value))}
          className={cn(s.tabs({ class: slots.tabs }), 'grid gap-2')}
        >
          <TabsList aria-label="Sheets" className={s.tabList({ class: slots.tabList })}>
            {sheets.map((sheet, i) => (
              <TabsTrigger key={sheet.name} value={String(i)}>
                {sheet.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {/* Only the open sheet renders; its panel keeps the tabs' ARIA references valid. */}
          <TabsContent value={String(index)}>{content}</TabsContent>
        </Tabs>
      ) : (
        content
      )}
    </div>
  )
}
