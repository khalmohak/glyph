import { cn, SegmentedControl, tv, useComponentConfig, VisuallyHidden } from '@glyphui/ui'
import { Fragment, useMemo, useState } from 'react'
import { heightStyle, type StylesEntry, viewerFrameStyles } from '../internal/frame'
import { ExpandRowsIcon } from '../internal/icons'
import { useViewersStylesCheck } from '../internal/styles-check'
import {
  computeDiff,
  type DiffItem,
  type DiffLine,
  type DiffSegment,
  type SplitRow,
  toSplitRows,
} from './compute'

export const diffViewerStyles = /* @__PURE__ */ tv({
  extend: viewerFrameStyles,
  slots: {
    stats: 'flex items-center gap-2 font-mono text-caption tabular-nums',
    added: 'text-success-text',
    removed: 'text-danger-text',
    scroller: 'h-full overflow-auto',
    table: 'w-full min-w-fit border-collapse font-mono text-[0.8125rem] leading-6',
    number:
      'w-12 min-w-12 px-2 text-right align-top text-faint-foreground tabular-nums select-none in-data-[change=added]:text-muted-foreground in-data-[change=removed]:text-muted-foreground',
    sign: 'w-5 min-w-5 text-center align-top select-none',
    code: 'pr-4 align-top whitespace-pre',
    gap: 'bg-muted/50 text-muted-foreground',
    gapButton:
      'flex w-full items-center gap-2 px-3 py-1 text-left text-caption hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring [&>svg]:size-3.5',
    word: 'rounded-[2px]',
  },
  variants: {
    wrap: { true: { code: 'whitespace-pre-wrap break-words' } },
  },
})

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    DiffViewer: StylesEntry<typeof diffViewerStyles>
  }
}

export interface DiffViewerProps {
  /** The text before the change. */
  oldValue: string
  /** The text after the change. */
  newValue: string
  /** Shown in the header, e.g. the file path. */
  fileName?: string
  /** `unified` (one column) or `split` (side by side). Users can switch. Default unified. */
  defaultView?: 'unified' | 'split'
  /** Unchanged lines kept around each change; longer stretches fold. Default 3. */
  context?: number
  /** Wrap long lines. Default false. */
  wrap?: boolean
  /** Height of the viewer; content scrolls inside. */
  height?: number | string
  /** Draw the viewer as a bordered card. Default true. */
  bordered?: boolean
  className?: string
}

const rowTone = {
  added: 'bg-success/10',
  removed: 'bg-danger/10',
  context: '',
} as const
const wordTone = { added: 'bg-success/30', removed: 'bg-danger/30', context: '' } as const

function Segments({ line, wordClass }: { line: DiffLine; wordClass: string }) {
  if (!line.segments) return <>{line.text || ' '}</>
  return (
    <>
      {line.segments.map((segment: DiffSegment, i) =>
        segment.changed ? (
          <mark key={i} className={cn(wordClass, wordTone[line.type], 'text-inherit')}>
            {segment.text}
          </mark>
        ) : (
          <Fragment key={i}>{segment.text}</Fragment>
        ),
      )}
    </>
  )
}

const signs = { added: '+', removed: '−', context: ' ' } as const
const spoken = { added: 'Added', removed: 'Removed', context: '' } as const

/**
 * The difference between two texts, unified or side by side, with changed words
 * highlighted and unchanged stretches folded. Needs `diff`.
 */
export function DiffViewer(inProps: DiffViewerProps) {
  const [props, slots] = useComponentConfig('DiffViewer', inProps)
  const {
    oldValue,
    newValue,
    fileName,
    defaultView = 'unified',
    context = 3,
    wrap = false,
    height,
    bordered = true,
    className,
  } = props
  useViewersStylesCheck()
  const [view, setView] = useState(defaultView)
  const [opened, setOpened] = useState<ReadonlySet<string>>(new Set())
  const diff = useMemo(
    () => computeDiff(oldValue, newValue, { context }),
    [oldValue, newValue, context],
  )
  const s = diffViewerStyles({ bordered, wrap })

  // Expanded gaps are replaced by their lines.
  const items = useMemo(
    () =>
      diff.items.flatMap((item): DiffItem[] =>
        item.type === 'gap' && opened.has(item.id) ? item.lines : [item],
      ),
    [diff, opened],
  )

  const gapRow = (item: Extract<DiffItem, { type: 'gap' }>, colSpan: number) => (
    <tr key={item.id} className={s.gap({ class: slots.gap })}>
      <td colSpan={colSpan} className="p-0">
        <button
          type="button"
          className={s.gapButton({ class: slots.gapButton })}
          onClick={() => setOpened((set) => new Set(set).add(item.id))}
        >
          <ExpandRowsIcon aria-hidden="true" />
          Show {item.lines.length} unchanged {item.lines.length === 1 ? 'line' : 'lines'}
        </button>
      </td>
    </tr>
  )

  const unified = () => (
    <table className={s.table({ class: slots.table })}>
      <thead className="sr-only">
        <tr>
          <th scope="col">Old line</th>
          <th scope="col">New line</th>
          <th scope="col">Change</th>
          <th scope="col">Code</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => {
          if (item.type === 'gap') return gapRow(item, 4)
          return (
            <tr key={i} className={rowTone[item.type]} data-change={item.type}>
              <td className={s.number({ class: slots.number })}>{item.oldNumber}</td>
              <td className={s.number({ class: slots.number })}>{item.newNumber}</td>
              <td
                className={cn(
                  s.sign({ class: slots.sign }),
                  item.type === 'added' && s.added({ class: slots.added }),
                  item.type === 'removed' && s.removed({ class: slots.removed }),
                )}
                aria-hidden="true"
              >
                {signs[item.type]}
              </td>
              <td className={s.code({ class: slots.code })}>
                {spoken[item.type] && <VisuallyHidden>{spoken[item.type]}: </VisuallyHidden>}
                <Segments line={item} wordClass={s.word({ class: slots.word })} />
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )

  const side = (line: DiffLine | undefined, which: 'left' | 'right') => {
    const number = which === 'left' ? line?.oldNumber : line?.newNumber
    const tone = line && line.type !== 'context' ? rowTone[line.type] : ''
    return (
      <>
        <td
          className={cn(
            s.number({ class: slots.number }),
            tone,
            tone && 'text-muted-foreground',
            which === 'right' && 'border-l border-border',
          )}
        >
          {number}
        </td>
        <td className={cn(s.code({ class: slots.code }), tone, 'w-1/2')}>
          {line ? (
            <>
              {spoken[line.type] && <VisuallyHidden>{spoken[line.type]}: </VisuallyHidden>}
              <Segments line={line} wordClass={s.word({ class: slots.word })} />
            </>
          ) : null}
        </td>
      </>
    )
  }

  const split = () => {
    const rows: (SplitRow | Extract<DiffItem, { type: 'gap' }>)[] = []
    let block: DiffLine[] = []
    for (const item of items) {
      if (item.type === 'gap') {
        rows.push(...toSplitRows(block), item)
        block = []
      } else block.push(item)
    }
    rows.push(...toSplitRows(block))
    return (
      <table className={s.table({ class: slots.table })}>
        <thead className="sr-only">
          <tr>
            <th scope="col">Old line</th>
            <th scope="col">Before</th>
            <th scope="col">New line</th>
            <th scope="col">After</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) =>
            'type' in row ? (
              gapRow(row, 4)
            ) : (
              <tr key={i}>
                {side(row.left, 'left')}
                {side(row.right, 'right')}
              </tr>
            ),
          )}
        </tbody>
      </table>
    )
  }

  return (
    <div
      data-slot="diff-viewer"
      data-glyph-code=""
      className={cn(s.root({ class: slots.root }), className)}
      style={heightStyle(height)}
    >
      <div className={s.toolbar({ class: slots.toolbar })}>
        {fileName && <span className={s.title({ class: slots.title })}>{fileName}</span>}
        <span className={s.stats({ class: slots.stats })}>
          <span className={s.added({ class: slots.added })}>+{diff.additions}</span>
          <span className={s.removed({ class: slots.removed })}>−{diff.deletions}</span>
          <VisuallyHidden>
            {diff.additions} {diff.additions === 1 ? 'line' : 'lines'} added, {diff.deletions}{' '}
            removed
          </VisuallyHidden>
        </span>
        <span className={s.spacer({ class: slots.spacer })} />
        <SegmentedControl<'unified' | 'split'>
          aria-label="Layout"
          size="sm"
          value={view}
          onValueChange={setView}
          options={[
            { value: 'unified', label: 'Unified' },
            { value: 'split', label: 'Split' },
          ]}
        />
      </div>
      <div className={s.body({ class: slots.body })}>
        <section
          className={s.scroller({ class: slots.scroller })}
          // biome-ignore lint/a11y/noNoninteractiveTabindex: scrollable region must be keyboard reachable
          tabIndex={0}
          aria-label={fileName ? `Changes to ${fileName}` : 'Changes'}
        >
          {diff.additions === 0 && diff.deletions === 0 ? (
            <p className="p-4 text-small text-muted-foreground">No changes.</p>
          ) : view === 'split' ? (
            split()
          ) : (
            unified()
          )}
        </section>
      </div>
    </div>
  )
}
