import { Button, cn, EmptyState, tv, useComponentConfig } from '@glyphui/ui'
import { type ComponentType, lazy, type ReactNode, Suspense, useEffect, useMemo } from 'react'
import type { CodeViewerProps } from '../code/code-viewer'
import type { CsvViewerProps } from '../csv/csv-viewer'
import { download } from '../internal/browser'
import {
  heightStyle,
  type StylesEntry,
  ToolButton,
  ViewerStatus,
  viewerFrameStyles,
} from '../internal/frame'
import {
  BracesIcon,
  CodeIcon,
  DownloadIcon,
  FileIcon,
  FileTextIcon,
  FilmIcon,
  ImageIcon,
  MusicIcon,
  TableIcon,
} from '../internal/icons'
import { formatBytes, readText, sourceName, type ViewerSource } from '../internal/source'
import { useViewersStylesCheck } from '../internal/styles-check'
import { useResource } from '../internal/use-resource'
import type { MarkdownViewerProps } from '../markdown/markdown-viewer'
import type { PdfViewerProps } from '../pdf/pdf-viewer'
import type { SpreadsheetViewerProps } from '../spreadsheet/spreadsheet-viewer'
import { detectFileKind, type FileKind } from './detect'

// Built in: these viewers need no extra packages, and load only when a file needs them.
const ImageViewer = lazy(() =>
  import('../media/image-viewer').then((m) => ({ default: m.ImageViewer })),
)
const VideoPlayer = lazy(() =>
  import('../media/video-player').then((m) => ({ default: m.VideoPlayer })),
)
const AudioPlayer = lazy(() =>
  import('../media/audio-player').then((m) => ({ default: m.AudioPlayer })),
)
const JsonViewer = lazy(() =>
  import('../json/json-viewer').then((m) => ({ default: m.JsonViewer })),
)

/**
 * Loaders for viewers that need extra packages. Add the ones your app uses, so bundles
 * only include what can actually be shown:
 *
 * ```ts
 * const loaders = {
 *   pdf: () => import('@glyphui/viewers/pdf'),
 *   csv: () => import('@glyphui/viewers/csv'),
 * }
 * ```
 */
export interface ViewerLoaders {
  pdf?: () => Promise<{ PdfViewer: ComponentType<PdfViewerProps> }>
  csv?: () => Promise<{ CsvViewer: ComponentType<CsvViewerProps> }>
  spreadsheet?: () => Promise<{ SpreadsheetViewer: ComponentType<SpreadsheetViewerProps> }>
  code?: () => Promise<{ CodeViewer: ComponentType<CodeViewerProps> }>
  markdown?: () => Promise<{ MarkdownViewer: ComponentType<MarkdownViewerProps> }>
}

export const filePreviewStyles = /* @__PURE__ */ tv({
  extend: viewerFrameStyles,
  slots: {
    icon: 'flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground [&>svg]:size-4',
    meta: 'grid min-w-0 leading-tight',
    name: 'truncate text-small font-medium text-foreground',
    detail: 'truncate text-caption text-muted-foreground',
    content: 'h-full min-h-0 overflow-auto',
    padded: 'p-3',
    text: 'm-0 p-4 font-mono text-[0.8125rem] leading-relaxed whitespace-pre-wrap break-words text-foreground',
  },
})

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    FilePreview: StylesEntry<typeof filePreviewStyles>
  }
}

export interface FilePreviewProps {
  /** The file: a File/Blob (e.g. from FileUpload), a URL, or bytes. */
  file: ViewerSource
  /** File name, when `file` isn't a File. Used to pick the viewer and for downloads. */
  name?: string
  /** MIME type, when the name doesn't tell. */
  type?: string
  /** Viewers that need extra packages (PDF, CSV, spreadsheets, code, Markdown). */
  loaders?: ViewerLoaders
  /** Height of the preview. Default 520. */
  height?: number | string
  /** Show the header with name, size and download. Default true. */
  header?: boolean
  /** Draw the preview as a bordered card. Default true. */
  bordered?: boolean
  className?: string
}

const kindIcon: Record<FileKind, ReactNode> = {
  pdf: <FileTextIcon />,
  csv: <TableIcon />,
  spreadsheet: <TableIcon />,
  json: <BracesIcon />,
  markdown: <FileTextIcon />,
  code: <CodeIcon />,
  text: <FileTextIcon />,
  image: <ImageIcon />,
  video: <FilmIcon />,
  audio: <MusicIcon />,
  unknown: <FileIcon />,
}

const kindLabel: Record<FileKind, string> = {
  pdf: 'PDF document',
  csv: 'CSV file',
  spreadsheet: 'Spreadsheet',
  json: 'JSON',
  markdown: 'Markdown',
  code: 'Source code',
  text: 'Text file',
  image: 'Image',
  video: 'Video',
  audio: 'Audio',
  unknown: 'File',
}

// Bundlers replace process.env.NODE_ENV; the typeof guard keeps unbundled browsers safe.
declare const process: { env: { NODE_ENV?: string } } | undefined
const warned = new Set<string>()

function useLoaded<K extends keyof ViewerLoaders>(
  loaders: ViewerLoaders | undefined,
  kind: K,
  pick: string,
) {
  const loader = loaders?.[kind]
  // biome-ignore lint/correctness/useExhaustiveDependencies: `pick` is a constant per kind
  return useMemo(
    () =>
      loader
        ? lazy(() =>
            // biome-ignore lint/suspicious/noExplicitAny: each viewer's props are checked where it's rendered
            (loader as () => Promise<Record<string, ComponentType<any>>>)().then((m) => ({
              // biome-ignore lint/suspicious/noExplicitAny: as above
              default: m[pick] as ComponentType<any>,
            })),
          )
        : null,
    [loader],
  )
}

function TextPreview({ file, className }: { file: ViewerSource; className: string }) {
  const text = useResource((signal) => readText(file, signal), [file])
  if (text.status === 'loading') return <ViewerStatus status="loading" />
  if (text.status === 'error')
    return <ViewerStatus status="error" error={text.error} onRetry={text.reload} />
  return (
    // biome-ignore lint/a11y/noNoninteractiveTabindex: scrollable text must be keyboard reachable
    <pre className={className} tabIndex={0}>
      {text.data}
    </pre>
  )
}

/**
 * Shows any file with the right viewer, picked from its name or MIME type: images, video,
 * audio, JSON and text out of the box; PDF, CSV, spreadsheets, code and Markdown when you
 * pass their `loaders`. Anything else gets a download button.
 */
export function FilePreview(inProps: FilePreviewProps) {
  const [props, slots] = useComponentConfig('FilePreview', inProps)
  const {
    file,
    name: nameProp,
    type: typeProp,
    loaders,
    height = 520,
    header = true,
    bordered = true,
    className,
  } = props
  useViewersStylesCheck()
  const s = filePreviewStyles({ bordered })
  const name = nameProp ?? sourceName(file) ?? 'file'
  const type =
    typeProp ?? (typeof Blob !== 'undefined' && file instanceof Blob ? file.type : undefined)
  const size = typeof Blob !== 'undefined' && file instanceof Blob ? file.size : undefined
  const kind = detectFileKind({ name, type })

  const Pdf = useLoaded(loaders, 'pdf', 'PdfViewer') as ComponentType<PdfViewerProps> | null
  const Csv = useLoaded(loaders, 'csv', 'CsvViewer') as ComponentType<CsvViewerProps> | null
  const Sheet = useLoaded(
    loaders,
    'spreadsheet',
    'SpreadsheetViewer',
  ) as ComponentType<SpreadsheetViewerProps> | null
  const Code = useLoaded(loaders, 'code', 'CodeViewer') as ComponentType<CodeViewerProps> | null
  const Md = useLoaded(
    loaders,
    'markdown',
    'MarkdownViewer',
  ) as ComponentType<MarkdownViewerProps> | null

  const needs: Partial<Record<FileKind, keyof ViewerLoaders>> = {
    pdf: 'pdf',
    csv: 'csv',
    spreadsheet: 'spreadsheet',
    code: 'code',
    markdown: 'markdown',
  }
  const missing =
    needs[kind] && !loaders?.[needs[kind] as keyof ViewerLoaders] ? needs[kind] : undefined
  useEffect(() => {
    if (!missing || warned.has(missing) || typeof process === 'undefined') return
    if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') return
    warned.add(missing)
    console.warn(
      `[glyph] FilePreview can't show ${kindLabel[kind]}s without a loader. Pass loaders={{ ${missing}: () => import('@glyphui/viewers/${missing}') }}.`,
    )
  }, [missing, kind])

  const fill = '100%'
  let body: ReactNode
  switch (kind) {
    case 'image':
      body = (
        <ImageViewer source={file} alt={name} height={fill} bordered={false} downloadable={false} />
      )
      break
    case 'video':
      body = (
        <div className={s.padded({ class: slots.padded })}>
          <VideoPlayer source={file} title={name} />
        </div>
      )
      break
    case 'audio':
      body = (
        <div className={s.padded({ class: slots.padded })}>
          <AudioPlayer source={file} title={name} />
        </div>
      )
      break
    case 'json':
      body = <JsonViewer source={file} height={fill} bordered={false} label={name} />
      break
    case 'text':
      body = <TextPreview file={file} className={s.text({ class: slots.text })} />
      break
    case 'pdf':
      body = Pdf && <Pdf source={file} fileName={name} height={fill} bordered={false} />
      break
    case 'csv':
      body = Csv && (
        <div className={s.padded({ class: slots.padded })}>
          <Csv source={file} fileName={name} height={360} />
        </div>
      )
      break
    case 'spreadsheet':
      body = Sheet && (
        <div className={s.padded({ class: slots.padded })}>
          <Sheet source={file} fileName={name} height={360} />
        </div>
      )
      break
    case 'code':
      body = Code && (
        <Code source={file} fileName={name} bordered={false} hideHeader={header} height={fill} />
      )
      break
    case 'markdown':
      body = Md && (
        <div className="p-6">
          <Md source={file} />
        </div>
      )
      break
  }

  return (
    <div
      data-slot="file-preview"
      data-kind={kind}
      className={cn(s.root({ class: slots.root }), className)}
      style={heightStyle(height)}
    >
      {header && (
        <div className={s.toolbar({ class: slots.toolbar })}>
          <span className={s.icon({ class: slots.icon })} aria-hidden="true">
            {kindIcon[kind]}
          </span>
          <span className={s.meta({ class: slots.meta })}>
            <span className={s.name({ class: slots.name })}>{name}</span>
            <span className={s.detail({ class: slots.detail })}>
              {kindLabel[kind]}
              {size !== undefined && ` · ${formatBytes(size)}`}
            </span>
          </span>
          <span className={s.spacer({ class: slots.spacer })} />
          <ToolButton
            label={`Download ${name}`}
            icon={<DownloadIcon />}
            onClick={() => download(file, name)}
          />
        </div>
      )}
      <div className={cn(s.body({ class: slots.body }), s.content({ class: slots.content }))}>
        {body ? (
          <Suspense fallback={<ViewerStatus status="loading" />}>{body}</Suspense>
        ) : (
          <div className="flex h-full items-center justify-center p-6">
            <EmptyState
              icon={kindIcon[kind]}
              title="No preview for this file"
              description={`${name} can’t be shown here, but you can download it.`}
              action={
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<DownloadIcon />}
                  onClick={() => download(file, name)}
                >
                  Download
                </Button>
              }
            />
          </div>
        )}
      </div>
    </div>
  )
}
