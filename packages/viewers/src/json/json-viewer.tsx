import { cn, EmptyState, Input, SegmentedControl, tv, useComponentConfig } from '@glyphui/ui'
import {
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import { copyText, useFlash } from '../internal/browser'
import {
  heightStyle,
  type StylesEntry,
  ToolButton,
  ViewerStatus,
  viewerFrameStyles,
} from '../internal/frame'
import { highlight, markClass } from '../internal/highlight'
import {
  BracesIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CollapseRowsIcon,
  CopyIcon,
  ExpandRowsIcon,
  SearchIcon,
} from '../internal/icons'
import { readText, type ViewerSource } from '../internal/source'
import { useViewersStylesCheck } from '../internal/styles-check'
import { useResource } from '../internal/use-resource'
import { useFixedVirtualList } from '../internal/virtual-list'
import {
  ancestors,
  expandedToDepth,
  flattenVisible,
  formatPrimitive,
  indexJson,
  type JsonNode,
  type JsonParseError,
  parseJson,
  searchJson,
  stringifyJson,
  summary,
} from './model'

export const jsonViewerStyles = /* @__PURE__ */ tv({
  extend: viewerFrameStyles,
  slots: {
    search: 'w-full max-w-56',
    counter: 'min-w-16 text-caption text-muted-foreground tabular-nums',
    tree: 'h-full overflow-auto font-mono text-[0.8125rem] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
    row: 'absolute inset-x-0 flex h-6 cursor-default items-center gap-1 whitespace-nowrap pr-3 data-[active]:bg-primary/10 data-[match]:bg-warning/12 hover:bg-muted/60',
    toggle:
      'flex size-4 shrink-0 items-center justify-center text-muted-foreground [&>svg]:size-3.5',
    key: 'text-foreground',
    punct: 'text-muted-foreground',
    meta: 'text-faint-foreground',
    raw: 'h-full overflow-auto p-3 font-mono text-[0.8125rem] leading-relaxed whitespace-pre text-foreground',
    path: 'min-w-0 truncate font-mono',
  },
  variants: {
    type: {
      string: { row: '[&_[data-value]]:text-success-text' },
      number: { row: '[&_[data-value]]:text-info-text' },
      boolean: { row: '[&_[data-value]]:text-warning-text' },
      null: { row: '[&_[data-value]]:text-faint-foreground [&_[data-value]]:italic' },
      object: {},
      array: {},
    },
  },
})

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    JsonViewer: StylesEntry<typeof jsonViewerStyles>
  }
}

export interface JsonViewerProps {
  /** A JSON file: a URL, a File/Blob, or bytes. */
  source?: ViewerSource
  /** JSON text, instead of `source`. */
  content?: string
  /** An already parsed value, instead of `source` or `content`. */
  data?: unknown
  /** Levels expanded at first. Default 2. Use `Infinity` to expand everything. */
  defaultExpandDepth?: number
  /** Height of the viewer. Default 420. */
  height?: number | string
  /** Draw the viewer as a bordered card. Default true. */
  bordered?: boolean
  /** Accessible name for the tree. Default "JSON". */
  label?: string
  className?: string
}

type Parsed =
  | { ok: true; value: unknown; text: string }
  | { ok: false; error: JsonParseError; text: string }

function parsed(text: string): Parsed {
  const result = parseJson(text)
  return result.ok
    ? { ok: true, value: result.value, text }
    : { ok: false, error: result.error, text }
}

const ROW = 24
const INDENT = 16

/**
 * A JSON document as a collapsible tree: search with match navigation, expand to a depth,
 * copy a value or its JSONPath, or switch to the raw text. Large documents stay fast: only
 * rows in view are rendered.
 */
export function JsonViewer(inProps: JsonViewerProps) {
  const [props, slots] = useComponentConfig('JsonViewer', inProps)
  const { source, content, data, height = 420, ...rest } = props
  useViewersStylesCheck()

  // `data` and `content` render immediately; only a `source` needs loading.
  const direct = useMemo((): Parsed | undefined => {
    if (data !== undefined) return { ok: true, value: data, text: '' }
    if (content !== undefined) return parsed(content)
    return undefined
  }, [data, content])
  const loaded = useResource(
    async (signal): Promise<Parsed | undefined> => {
      if (direct || source === undefined) return undefined
      return parsed(await readText(source, signal))
    },
    [source, direct],
  )
  const result = direct ?? (loaded.status === 'success' ? loaded.data : undefined)

  const s = jsonViewerStyles({ bordered: rest.bordered ?? true })
  const frame = (body: ReactNode) => (
    <div
      data-slot="json-viewer"
      className={cn(s.root({ class: slots.root }), rest.className)}
      style={heightStyle(height)}
    >
      {body}
    </div>
  )

  if (!direct && source === undefined) {
    return frame(
      <ViewerStatus
        status="error"
        error={new Error('No JSON to show. Pass `source`, `content` or `data`.')}
      />,
    )
  }
  if (!result) {
    if (loaded.status === 'error') {
      return frame(<ViewerStatus status="error" error={loaded.error} onRetry={loaded.reload} />)
    }
    return frame(<ViewerStatus status="loading" />)
  }
  if (!result.ok) return frame(<JsonError error={result.error} text={result.text} />)
  return <JsonTree {...rest} value={result.value} height={height} slots={slots} />
}

function JsonError({ error, text }: { error: JsonParseError; text: string }) {
  const line = error.line ? text.split('\n')[error.line - 1] : undefined
  return (
    <EmptyState
      icon={<BracesIcon />}
      title="This isn't valid JSON"
      description={
        <span className="grid gap-2">
          <span>
            {error.line ? `Line ${error.line}, column ${error.column}: ` : ''}
            {error.message}
          </span>
          {line !== undefined && (
            <code className="block overflow-x-auto rounded-lg bg-muted px-2 py-1 text-left font-mono text-caption whitespace-pre text-foreground">
              {line}
              {'\n'}
              {`${' '.repeat(Math.max(0, (error.column ?? 1) - 1))}^`}
            </code>
          )}
        </span>
      }
    />
  )
}

function JsonTree({
  value,
  defaultExpandDepth = 2,
  height,
  bordered = true,
  label = 'JSON',
  className,
  slots,
}: Omit<JsonViewerProps, 'source' | 'content' | 'data'> & {
  value: unknown
  slots: Partial<Record<string, string>>
}) {
  const s = jsonViewerStyles({ bordered })
  const id = useId()
  const index = useMemo(() => indexJson(value), [value])
  const [expanded, setExpanded] = useState(() => expandedToDepth(index, defaultExpandDepth))
  const [view, setView] = useState<'tree' | 'raw'>('tree')
  const [query, setQuery] = useState('')
  const [matchIndex, setMatchIndex] = useState(0)
  const [active, setActive] = useState('$')
  const [copied, flashCopied] = useFlash()
  const [copiedPath, flashCopiedPath] = useFlash()
  const viewport = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setExpanded(expandedToDepth(index, defaultExpandDepth))
    setActive('$')
  }, [index, defaultExpandDepth])

  const rows = useMemo(() => flattenVisible(index, expanded), [index, expanded])
  const matches = useMemo(() => searchJson(index, query), [index, query])
  const matchSet = useMemo(() => new Set(matches), [matches])
  const list = useFixedVirtualList(viewport, rows.length, ROW)

  const reveal = useCallback(
    (path: string) => {
      setExpanded((open) => {
        const missing = ancestors(index, path).filter((p) => !open.has(p))
        if (missing.length === 0) return open
        const next = new Set(open)
        for (const p of missing) next.add(p)
        return next
      })
      setActive(path)
    },
    [index],
  )

  // Keep the active row in view after it changes (search, keyboard, reveal).
  useEffect(() => {
    const i = rows.findIndex((row) => row.path === active)
    if (i >= 0) list.scrollToIndex(i)
  }, [active, rows, list.scrollToIndex])

  const goToMatch = (next: number) => {
    if (matches.length === 0) return
    const i = (next + matches.length) % matches.length
    setMatchIndex(i)
    reveal(matches[i] as string)
  }

  const toggle = (node: JsonNode) => {
    if (node.children.length === 0) return
    setExpanded((open) => {
      const next = new Set(open)
      if (next.has(node.path)) next.delete(node.path)
      else next.add(node.path)
      return next
    })
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const i = rows.findIndex((row) => row.path === active)
    const node = rows[i]
    if (!node) return
    const move = (to: number) => {
      const target = rows[Math.max(0, Math.min(rows.length - 1, to))]
      if (target) setActive(target.path)
    }
    switch (event.key) {
      case 'ArrowDown':
        move(i + 1)
        break
      case 'ArrowUp':
        move(i - 1)
        break
      case 'Home':
        move(0)
        break
      case 'End':
        move(rows.length - 1)
        break
      case 'PageDown':
        move(i + 10)
        break
      case 'PageUp':
        move(i - 10)
        break
      case 'ArrowRight':
        if (node.children.length > 0 && !expanded.has(node.path)) toggle(node)
        else if (expanded.has(node.path)) move(i + 1)
        break
      case 'ArrowLeft':
        if (expanded.has(node.path)) toggle(node)
        else if (node.parent) setActive(node.parent)
        break
      case 'Enter':
      case ' ':
        toggle(node)
        break
      default:
        return
    }
    event.preventDefault()
  }

  const activeNode = index.nodes.get(active) ?? index.root
  const rowId = (path: string) =>
    `${id}-${path.replace(/[^\w$-]/g, (c) => c.charCodeAt(0).toString(36))}`

  return (
    <div
      data-slot="json-viewer"
      className={cn(s.root({ class: slots.root }), className)}
      style={heightStyle(height)}
    >
      <div role="toolbar" aria-label="JSON tools" className={s.toolbar({ class: slots.toolbar })}>
        <SegmentedControl<'tree' | 'raw'>
          aria-label="View"
          size="sm"
          value={view}
          onValueChange={setView}
          options={[
            { value: 'tree', label: 'Tree' },
            { value: 'raw', label: 'Raw' },
          ]}
        />
        {view === 'tree' && (
          <>
            <span className={s.divider({ class: slots.divider })} />
            <Input
              size="sm"
              type="search"
              aria-label="Search keys and values"
              placeholder="Search…"
              prefix={<SearchIcon />}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setMatchIndex(0)
                const first = searchJson(index, event.target.value)[0]
                if (first) reveal(first)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  goToMatch(matchIndex + (event.shiftKey ? -1 : 1))
                }
              }}
              className={s.search({ class: slots.search })}
            />
            {query.trim() && (
              <span className={s.counter({ class: slots.counter })} aria-live="polite">
                {matches.length === 0 ? 'No matches' : `${matchIndex + 1} of ${matches.length}`}
              </span>
            )}
            <ToolButton
              label="Previous match"
              icon={<ChevronUpIcon />}
              disabled={matches.length === 0}
              onClick={() => goToMatch(matchIndex - 1)}
            />
            <ToolButton
              label="Next match"
              icon={<ChevronDownIcon />}
              disabled={matches.length === 0}
              onClick={() => goToMatch(matchIndex + 1)}
            />
            <span className={s.spacer({ class: slots.spacer })} />
            <ToolButton
              label="Expand all"
              icon={<ExpandRowsIcon />}
              onClick={() => setExpanded(expandedToDepth(index, Number.POSITIVE_INFINITY))}
            />
            <ToolButton
              label="Collapse all"
              icon={<CollapseRowsIcon />}
              onClick={() => {
                setExpanded(new Set(['$']))
                setActive('$')
              }}
            />
          </>
        )}
        {view === 'raw' && <span className={s.spacer({ class: slots.spacer })} />}
        <ToolButton
          label={copied ? 'Copied' : 'Copy JSON'}
          icon={copied ? <CheckIcon /> : <CopyIcon />}
          onClick={async () => {
            if (await copyText(stringifyJson(value))) flashCopied()
          }}
        />
      </div>

      <div className={s.body({ class: slots.body })}>
        {view === 'raw' ? (
          <section
            className={s.raw({ class: slots.raw })}
            aria-label={`${label}, raw text`}
            // biome-ignore lint/a11y/noNoninteractiveTabindex: scrollable text must be keyboard reachable
            tabIndex={0}
          >
            <pre className="m-0">{stringifyJson(value)}</pre>
          </section>
        ) : (
          <div
            ref={viewport}
            role="tree"
            aria-label={label}
            tabIndex={0}
            aria-activedescendant={rowId(active)}
            onKeyDown={onKeyDown}
            className={s.tree({ class: slots.tree })}
          >
            <div style={{ height: list.totalHeight, position: 'relative' }}>
              {rows.slice(list.start, list.end).map((node, offset) => {
                const i = list.start + offset
                const container = node.children.length > 0
                const open = expanded.has(node.path)
                const siblings = node.parent
                  ? (index.nodes.get(node.parent)?.children.length ?? 1)
                  : 1
                const position = node.parent
                  ? (index.nodes.get(node.parent)?.children.indexOf(node.path) ?? 0) + 1
                  : 1
                return (
                  // Rows are reached with the arrow keys through aria-activedescendant on the tree.
                  // biome-ignore lint/a11y/useKeyWithClickEvents: the tree handles the keys
                  // biome-ignore lint/a11y/useFocusableInteractive: focus stays on the tree
                  <div
                    key={node.path}
                    id={rowId(node.path)}
                    role="treeitem"
                    aria-level={node.depth + 1}
                    aria-setsize={siblings}
                    aria-posinset={position}
                    aria-selected={node.path === active}
                    {...(container && { 'aria-expanded': open })}
                    data-active={node.path === active ? '' : undefined}
                    data-match={matchSet.has(node.path) ? '' : undefined}
                    onClick={() => {
                      setActive(node.path)
                      toggle(node)
                    }}
                    className={s.row({ type: node.type, class: slots.row })}
                    style={{ top: i * ROW, paddingLeft: 8 + node.depth * INDENT }}
                  >
                    <span className={s.toggle({ class: slots.toggle })}>
                      {container && (open ? <ChevronDownIcon /> : <ChevronRightIcon />)}
                    </span>
                    {node.key !== undefined && (
                      <>
                        <span className={s.key({ class: slots.key })}>
                          {typeof node.key === 'number'
                            ? node.key
                            : highlight(node.key, query, markClass)}
                        </span>
                        <span className={s.punct({ class: slots.punct })}>:</span>
                      </>
                    )}
                    {container || node.type === 'object' || node.type === 'array' ? (
                      <span className={s.meta({ class: slots.meta })}>{summary(node)}</span>
                    ) : (
                      <span data-value>{highlight(formatPrimitive(node), query, markClass)}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {view === 'tree' && (
        <div className={s.footer({ class: slots.footer })}>
          <span className={s.path({ class: slots.path })} title={activeNode.path}>
            {activeNode.path}
          </span>
          <span className="flex items-center gap-1">
            <ToolButton
              label={copiedPath ? 'Copied path' : 'Copy path'}
              icon={copiedPath ? <CheckIcon /> : <BracesIcon />}
              onClick={async () => {
                if (await copyText(activeNode.path)) flashCopiedPath()
              }}
            />
            <ToolButton
              label="Copy value"
              icon={<CopyIcon />}
              onClick={() =>
                copyText(
                  typeof activeNode.value === 'string'
                    ? activeNode.value
                    : stringifyJson(activeNode.value),
                )
              }
            />
          </span>
        </div>
      )}
    </div>
  )
}
