---
"@glyphui/viewers": minor
---

New package: `@glyphui/viewers`, file and data viewers themed by your Glyph theme.

- `PdfViewer`: thumbnails, zoom (fit width, fit page, percent), rotation, search with highlights, selectable text, download, print, fullscreen, password-protected files. Only pages near the view render, so long documents stay fast.
- `CsvViewer` and `SpreadsheetViewer` (.xlsx): typed columns (numbers, dates, yes/no, text) shown through DataTable with search, filters from the data, column controls and CSV export. Big CSVs parse in a worker and render virtualized.
- `JsonViewer`: a keyboard-navigable tree with search, expand to depth, copy value or JSONPath, and a raw view.
- `CodeViewer` and `MarkdownViewer`: syntax colors from your theme, line highlights, wrap and copy; GitHub-flavored Markdown with heading links, safe by default.
- `DiffViewer`: unified or side by side, with changed words highlighted and unchanged lines folded.
- `ImageViewer`, `VideoPlayer`, `AudioPlayer` and `Waveform`: zoom and pan, themed media controls with captions, speed and keyboard shortcuts, and a waveform you can seek on.
- `FilePreview` and `FilePreviewDialog`: pick the right viewer from a file's name or type, with a download fallback.

Each viewer is its own entry point, with its library as an optional peer dependency.
