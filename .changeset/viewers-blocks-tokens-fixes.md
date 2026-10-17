---
"@glyphui/tokens": patch
"@glyphui/viewers": patch
"@glyphui/blocks": patch
---

Bug fixes found in a full review of tokens, viewers and blocks.

**Tokens**

- Focus rings are back in the editorial preset, and in any theme that sets a shadow to `none`. Tailwind draws a component's shadow and focus ring as one `box-shadow`, and a `none` inside it cancelled both, so keyboard users saw no focus on editorial buttons, inputs and cards. `none` is now written as an empty shadow.
- Themes loaded from data (per-tenant branding, a theme editor) can no longer break out of the generated CSS: values that contain `;`, `{`, `}`, comments or `</style>` stay inside their own declaration, and theme names are escaped in `ThemeScope` selectors.
- Merging a theme override parsed from JSON ignores `__proto__`, `constructor` and `prototype` keys.
- A spring with zero or negative stiffness or mass, negative damping, or `NaN` falls back to the default spring instead of producing an invalid CSS easing.

**Viewers**

- PdfViewer no longer leaks a pdf.js document (and its worker memory) when it unmounts, or its file changes, while pdf.js or the file is still loading. Search results reset when the document changes.
- Text files are decoded in the right encoding: UTF-16 files (Excel's "Unicode text") and Windows-1252 files (CSV files saved by Excel on Windows) now show accented characters correctly in CsvViewer, CodeViewer, JsonViewer and MarkdownViewer.
- Bytes from another realm (an iframe, a worker, Node's `TextEncoder`) are recognized instead of being fetched as a URL.
- File names in URLs with broken percent-encoding (`report%.pdf`) no longer crash the viewer.
- JsonViewer shows in-memory `data` the way `JSON.stringify` would (dates as strings, `undefined` keys left out, BigInt as numbers), marks circular references as `[Circular]` instead of freezing the page, handles very deep documents, and its raw view and copy buttons no longer throw on circular or BigInt data.
- MarkdownViewer gives repeated headings unique ids (`setup`, `setup-1`, …) so every anchor works, and images whose unsafe URL was removed no longer render with an empty `src`.
- DiffViewer ignores Windows line endings and a missing final newline, so files saved on another OS no longer show every line as changed.
- CodeViewer falls back to plain text when a grammar fails to load, and recovers on the next file instead of staying broken.
- FilePreview no longer mistakes files named `constructor` or `__proto__` for a known type.

**Blocks**

- Pricing's default price format shows cents with two digits and thousands with separators (`$19.50`, `$1,250`).
- Stats only counts up values that read back exactly as written, so `007`, `.5` and `00:05` keep their text.
- AuthCard and Newsletter submit once while a request is in flight, even when a password manager or script submits the form directly.
- SiteFooter renders every link when placeholder links share an `href`.
