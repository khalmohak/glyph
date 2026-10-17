# @glyphui/viewers

File and data viewers for [Glyph](https://github.com/khalmohak/glyph): PDF, CSV, spreadsheets, JSON, code, Markdown, diffs, images, video and audio, themed by your Glyph theme in light and dark.

[Docs](https://khalmohak.github.io/glyph/components) · [GitHub](https://github.com/khalmohak/glyph)

## Install

```sh
npm install @glyphui/viewers @glyphui/ui
```

```css
@import "tailwindcss";
@import "@glyphui/ui/styles.css";
@import "@glyphui/viewers/styles.css";
```

Each viewer is its own entry point, and the heavy libraries behind them are optional peer dependencies. Install only what you use:

| Import | Shows | Also install |
|---|---|---|
| `@glyphui/viewers/pdf` | `PdfViewer` | `pdfjs-dist` |
| `@glyphui/viewers/csv` | `CsvViewer` | `papaparse @tanstack/react-table@8 @tanstack/react-virtual` |
| `@glyphui/viewers/spreadsheet` | `SpreadsheetViewer` (.xlsx) | `read-excel-file @tanstack/react-table@8 @tanstack/react-virtual` |
| `@glyphui/viewers/json` | `JsonViewer` | nothing |
| `@glyphui/viewers/code` | `CodeViewer` | `shiki` |
| `@glyphui/viewers/markdown` | `MarkdownViewer` | `react-markdown remark-gfm shiki` |
| `@glyphui/viewers/diff` | `DiffViewer` | `diff` |
| `@glyphui/viewers/media` | `ImageViewer`, `VideoPlayer`, `AudioPlayer`, `Waveform` | nothing |
| `@glyphui/viewers` | `FilePreview`, `FilePreviewDialog` | the viewers you pass in `loaders` |

## Examples

```tsx
import { PdfViewer } from '@glyphui/viewers/pdf'
import { CsvViewer } from '@glyphui/viewers/csv'

<PdfViewer source="/report.pdf" height={640} />
<CsvViewer source={file} />            // a File from <FileUpload>, a URL, or bytes
```

Pick the right viewer for any file, loading only the ones you allow:

```tsx
import { FilePreview } from '@glyphui/viewers'

const loaders = {
  pdf: () => import('@glyphui/viewers/pdf'),
  csv: () => import('@glyphui/viewers/csv'),
}

<FilePreview file={file} loaders={loaders} />
```

Images, video, audio, JSON and plain text need no loaders.

## PDF worker

pdf.js parses in a Web Worker. By default the worker loads from jsDelivr, matching your installed `pdfjs-dist` version, so it works in Vite, webpack and Next.js without setup. To serve it yourself:

```ts
import { setPdfWorker } from '@glyphui/viewers/pdf'

// Vite
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
setPdfWorker(workerSrc)

// webpack 5 / Next.js
setPdfWorker(new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url))
```

## License

MIT. `PdfViewer`'s text-layer styles are adapted from pdf.js (Apache-2.0).
