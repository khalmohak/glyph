import { Badge, cn, tv, useComponentConfig } from '@glyphui/ui'
import { type CSSProperties, useEffect, useMemo, useState } from 'react'
import { copyText, useFlash } from '../internal/browser'
import {
  heightStyle,
  type StylesEntry,
  ToolButton,
  ViewerStatus,
  viewerFrameStyles,
} from '../internal/frame'
import { CheckIcon, CopyIcon, WrapIcon } from '../internal/icons'
import { readText, sourceName, type ViewerSource } from '../internal/source'
import { useViewersStylesCheck } from '../internal/styles-check'
import { useResource } from '../internal/use-resource'
import { type CodeToken, highlightCode, languageFromFileName, resolveLanguage } from './highlighter'

export const codeViewerStyles = /* @__PURE__ */ tv({
  extend: viewerFrameStyles,
  slots: {
    scroller: 'h-full overflow-auto',
    pre: 'm-0 min-w-fit py-3 font-mono text-[0.8125rem] leading-6 text-foreground',
    line: 'grid grid-cols-[auto_1fr] pr-4 data-[mark=highlight]:bg-primary/8 data-[mark=added]:bg-success/12 data-[mark=removed]:bg-danger/12',
    number:
      'sticky left-0 bg-inherit pr-4 pl-4 text-right text-faint-foreground tabular-nums select-none in-data-[mark]:text-muted-foreground',
    content: 'whitespace-pre',
  },
  variants: {
    wrap: { true: { pre: 'min-w-0', content: 'whitespace-pre-wrap break-words' } },
    numbered: { false: { line: 'pl-4', number: 'hidden' } },
  },
  defaultVariants: { wrap: false, numbered: true },
})

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    CodeViewer: StylesEntry<typeof codeViewerStyles>
  }
}

/** How a line is marked: a highlight, or an added/removed line in a diff. */
export type LineMark = 'highlight' | 'added' | 'removed'

export interface CodeViewerProps {
  /** The code to show. */
  code?: string
  /** A source file to load instead of `code`: a URL, a File/Blob, or bytes. */
  source?: ViewerSource
  /** Language id or file extension: `tsx`, `python`, `sql`… Guessed from `fileName` when unset. */
  language?: string
  /** Shown in the header; also used to guess the language. */
  fileName?: string
  /** Line numbers to highlight, e.g. `[3, [6, 9]]` or `"3,6-9"`. */
  highlightLines?: readonly (number | readonly [number, number])[] | string
  /** Marks for individual lines, by line number. Wins over `highlightLines`. */
  lineMarks?: Readonly<Record<number, LineMark>>
  /** Number of the first line. Default 1. */
  startLine?: number
  /** Show line numbers. Default true. */
  lineNumbers?: boolean
  /** Wrap long lines instead of scrolling sideways. Users can toggle it. Default false. */
  wrap?: boolean
  /** Hide the header bar (file name, language, wrap and copy). */
  hideHeader?: boolean
  /** Height of the viewer; content scrolls inside. Grows with the code by default. */
  height?: number | string
  /** Draw the viewer as a bordered card. Default true. */
  bordered?: boolean
  className?: string
}

/** Parses `"3,6-9"` or `[3, [6, 9]]` into a set of line numbers. */
export function parseLineRanges(input: CodeViewerProps['highlightLines']): Set<number> {
  const lines = new Set<number>()
  if (!input) return lines
  const items =
    typeof input === 'string'
      ? input.split(',').map((part) => {
          const [a, b] = part.split('-').map((n) => Number.parseInt(n.trim(), 10))
          return b !== undefined && !Number.isNaN(b) ? ([a, b] as const) : (a as number)
        })
      : input
  for (const item of items) {
    if (typeof item === 'number') {
      if (Number.isFinite(item)) lines.add(item)
    } else {
      const [from, to] = item
      if (from !== undefined && to !== undefined) for (let n = from; n <= to; n++) lines.add(n)
    }
  }
  return lines
}

function tokenStyle(token: CodeToken): CSSProperties | undefined {
  if (!token.color && !token.fontStyle) return undefined
  const style: CSSProperties = {}
  if (token.color) style.color = token.color
  if (token.fontStyle) {
    if (token.fontStyle & 1) style.fontStyle = 'italic'
    if (token.fontStyle & 2) style.fontWeight = 600
    if (token.fontStyle & 4) style.textDecoration = 'underline'
  }
  return style
}

/**
 * Source code with syntax highlighting that follows your theme, line numbers, highlighted
 * lines, wrap toggle and copy. Grammars load on first use. Needs `shiki`.
 */
export function CodeViewer(inProps: CodeViewerProps) {
  const [props, slots] = useComponentConfig('CodeViewer', inProps)
  const {
    code: codeProp,
    source,
    language,
    fileName,
    highlightLines,
    lineMarks,
    startLine = 1,
    lineNumbers = true,
    wrap: wrapProp = false,
    hideHeader = false,
    height,
    bordered = true,
    className,
  } = props
  useViewersStylesCheck()
  const [wrap, setWrap] = useState(wrapProp)
  useEffect(() => setWrap(wrapProp), [wrapProp])
  const [copied, flashCopied] = useFlash()
  const name = fileName ?? sourceName(source)
  const lang = resolveLanguage(language ?? languageFromFileName(name) ?? 'plaintext')

  // Inline `code` renders immediately; only a `source` needs loading.
  const loaded = useResource(
    async (signal) =>
      codeProp === undefined && source !== undefined ? readText(source, signal) : '',
    [codeProp, source],
  )
  const text = codeProp !== undefined ? ({ status: 'success', data: codeProp } as const) : loaded
  const code = text.status === 'success' ? text.data.replace(/\n$/, '') : ''

  const [tokens, setTokens] = useState<CodeToken[][] | null>(null)
  useEffect(() => {
    let cancelled = false
    setTokens(null)
    highlightCode(code, lang).then(
      (result) => !cancelled && setTokens(result),
      () => {},
    )
    return () => {
      cancelled = true
    }
  }, [code, lang])

  const highlighted = useMemo(() => parseLineRanges(highlightLines), [highlightLines])
  const lines: CodeToken[][] = tokens ?? code.split('\n').map((line) => [{ content: line }])
  // Every line's number column gets the width of the longest number, so code lines up.
  const numberWidth = `calc(${String(startLine + lines.length - 1).length}ch + 2rem)`
  const s = codeViewerStyles({ bordered, wrap, numbered: lineNumbers })

  return (
    <div
      data-slot="code-viewer"
      data-glyph-code=""
      className={cn(s.root({ class: slots.root }), className)}
      style={heightStyle(height)}
    >
      {!hideHeader && (
        <div className={s.toolbar({ class: slots.toolbar })}>
          {name && <span className={s.title({ class: slots.title })}>{name}</span>}
          {lang !== 'plaintext' && (
            <Badge variant="outline" className="font-mono">
              {lang}
            </Badge>
          )}
          <span className={s.spacer({ class: slots.spacer })} />
          <ToolButton
            label={wrap ? 'Don’t wrap lines' : 'Wrap lines'}
            icon={<WrapIcon />}
            aria-pressed={wrap}
            onClick={() => setWrap((w) => !w)}
          />
          <ToolButton
            label={copied ? 'Copied' : 'Copy code'}
            icon={copied ? <CheckIcon /> : <CopyIcon />}
            onClick={async () => {
              if (await copyText(code)) flashCopied()
            }}
          />
        </div>
      )}
      <div className={s.body({ class: slots.body })}>
        {text.status === 'loading' ? (
          <ViewerStatus status="loading" />
        ) : text.status === 'error' ? (
          <ViewerStatus status="error" error={loaded.error} onRetry={loaded.reload} />
        ) : (
          <section
            className={s.scroller({ class: slots.scroller })}
            // biome-ignore lint/a11y/noNoninteractiveTabindex: scrollable code must be keyboard reachable
            tabIndex={0}
            aria-label={name ?? 'Code'}
          >
            <pre className={s.pre({ class: slots.pre })}>
              <code>
                {lines.map((line, i) => {
                  const number = startLine + i
                  const mark =
                    lineMarks?.[number] ?? (highlighted.has(number) ? 'highlight' : undefined)
                  return (
                    <span
                      key={i}
                      className={s.line({ class: slots.line })}
                      data-mark={mark}
                      data-line={number}
                    >
                      <span
                        className={s.number({ class: slots.number })}
                        style={{ minWidth: numberWidth }}
                        aria-hidden="true"
                      >
                        {number}
                      </span>
                      <span className={s.content({ class: slots.content })}>
                        {line.length === 0 || (line.length === 1 && line[0]?.content === '')
                          ? '\n'
                          : line.map((token, j) => (
                              <span key={j} style={tokenStyle(token)}>
                                {token.content}
                              </span>
                            ))}
                      </span>
                    </span>
                  )
                })}
              </code>
            </pre>
          </section>
        )}
      </div>
    </div>
  )
}
