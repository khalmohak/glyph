import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'PdfViewer',
  slug: 'pdf-viewer',
  category: 'Viewers',
  status: 'beta',
  description:
    'Read PDFs in the page: thumbnails, zoom, rotation, search with highlights, selectable text, download, print and fullscreen.',
  entry: '@glyphui/viewers/pdf',
  exports: ['PdfViewer', 'pdfViewerStyles', 'setPdfWorker', 'cdnWorkerUrl'],
  source: 'pdf/pdf-viewer.tsx',
  propsOf: 'PdfViewer',
  examples: [
    {
      file: 'basic',
      title: 'A report',
      description: 'Search for “revenue”: matches highlight on every page.',
    },
    {
      file: 'local-file',
      title: 'A file the user picks',
      description: 'Works with File objects from FileUpload, without uploading anything.',
    },
    {
      file: 'start-page',
      title: 'Start page and zoom',
      description: 'Open on page 3, fitting the whole page, without thumbnails.',
    },
  ],
  notes: [
    'Install the optional peer dependency first: npm install pdfjs-dist.',
    'pdf.js parses in a Web Worker. By default it loads from jsDelivr, matching your pdfjs-dist version. To serve it yourself, call setPdfWorker once at startup: with Vite, import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url"; with webpack or Next.js, pass new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).',
    'Only pages near the view are rendered, so long documents stay fast; the page size you see comes from each page, so mixed sizes and orientations lay out correctly.',
    'Keyboard: Page Up/Down change pages, + and − zoom, 0 fits the width, R rotates, and ⌘F or Ctrl+F jumps to search.',
    'Each page is a labelled group with its text layer, so screen readers can read the document.',
    'pdf.js adds about 130 kB gzipped, plus a 365 kB worker that downloads in the background; both load only when a PdfViewer mounts.',
  ],
})
