# @glyphui/viewers

## 0.9.0

### Patch Changes

- [#42](https://github.com/khalmohak/glyph/pull/42) [`f576405`](https://github.com/khalmohak/glyph/commit/f576405d882b0d57679d91311edabf50d848bd36) Thanks [@khalmohak](https://github.com/khalmohak)! - npm descriptions and keywords for AI coding agents. `@glyphui/mcp` declares `mcpName` (`io.github.khalmohak/glyph`) and ships a `server.json`, so it can be listed in the official MCP Registry.

- [#38](https://github.com/khalmohak/glyph/pull/38) [`0eb5f45`](https://github.com/khalmohak/glyph/commit/0eb5f4512a10c07d70b65d3c5b63f5001155b717) Thanks [@khalmohak](https://github.com/khalmohak)! - PdfViewer sets `aria-busy` while a document loads, so screen readers know it isn't ready yet (its toolbar is disabled meanwhile).

## 0.8.2

### Patch Changes

- [#36](https://github.com/khalmohak/glyph/pull/36) [`c5bbf94`](https://github.com/khalmohak/glyph/commit/c5bbf947a4fa8f5e9bad9fb6d7eebdc36ff798d8) Thanks [@khalmohak](https://github.com/khalmohak)! - The docs moved to [glyphui.xyz](https://glyphui.xyz), with the demo apps at [demo.glyphui.xyz](https://demo.glyphui.xyz) and [auth.glyphui.xyz](https://auth.glyphui.xyz). Package homepages and README links point there; the old GitHub Pages links redirect.

## 0.8.1

## 0.8.0

### Minor Changes

- [#27](https://github.com/khalmohak/glyph/pull/27) [`bc2af02`](https://github.com/khalmohak/glyph/commit/bc2af02637abcb99897f31764e417f6ce7596fa3) Thanks [@khalmohak](https://github.com/khalmohak)! - New package: `@glyphui/viewers`, file and data viewers themed by your Glyph theme.

  - `PdfViewer`: thumbnails, zoom (fit width, fit page, percent), rotation, search with highlights, selectable text, download, print, fullscreen, password-protected files. Only pages near the view render, so long documents stay fast.
  - `CsvViewer` and `SpreadsheetViewer` (.xlsx): typed columns (numbers, dates, yes/no, text) shown through DataTable with search, filters from the data, column controls and CSV export. Big CSVs parse in a worker and render virtualized.
  - `JsonViewer`: a keyboard-navigable tree with search, expand to depth, copy value or JSONPath, and a raw view.
  - `CodeViewer` and `MarkdownViewer`: syntax colors from your theme, line highlights, wrap and copy; GitHub-flavored Markdown with heading links, safe by default.
  - `DiffViewer`: unified or side by side, with changed words highlighted and unchanged lines folded.
  - `ImageViewer`, `VideoPlayer`, `AudioPlayer` and `Waveform`: zoom and pan, themed media controls with captions, speed and keyboard shortcuts, and a waveform you can seek on.
  - `FilePreview` and `FilePreviewDialog`: pick the right viewer from a file's name or type, with a download fallback.

  Each viewer is its own entry point, with its library as an optional peer dependency.

### Patch Changes

- [#27](https://github.com/khalmohak/glyph/pull/27) [`bc2af02`](https://github.com/khalmohak/glyph/commit/bc2af02637abcb99897f31764e417f6ce7596fa3) Thanks [@khalmohak](https://github.com/khalmohak)! - `@glyphui/ui`, `@glyphui/blocks` and `@glyphui/tokens` are now peer dependencies of `@glyphui/auth`, `@glyphui/blocks` and `@glyphui/viewers`, so your app and Glyph share one copy. As regular dependencies, a version mismatch installed a second copy of `@glyphui/ui` with its own React context, and components like `UserMenu` crashed with "must be used inside GlyphProvider". Keep all `@glyphui/*` packages on the same version.

  `ForgotPasswordForm` copy now matches the reset method: with code-based resets it offers to send a code instead of a link.

- [#27](https://github.com/khalmohak/glyph/pull/27) [`bc2af02`](https://github.com/khalmohak/glyph/commit/bc2af02637abcb99897f31764e417f6ce7596fa3) Thanks [@khalmohak](https://github.com/khalmohak)! - Fixes from building a helpdesk app on a real bearer-token API.

  **Auth**

  - **Two-step sign-in works with bearer tokens on multi-user servers.** A server can return a `challenge` with `needs-second-factor` (and `needs-verification`); the client sends it back with the code, so the server knows which sign-in the code completes. The memory adapter and the example app now track each sign-in separately instead of one global "pending" user.
  - **Sign-in links can be completed.** New `completeMagicLink(token)` on the client and adapters (REST: `POST /auth/magic-link/verify`), and a `MagicLinkCallback` screen for the page the link opens.
  - **The session-expired dialog handles two-step accounts:** after the password it asks for the code right there instead of sending people to the sign-in page.
  - **SignUpForm `extraFields`** for invite codes, workspace names and similar. Values are validated with the form and passed to `signUp` as `extra`; the REST adapter sends them with the request.
  - **The code step says how the code arrived** (authenticator app, email or text) from the server's `method`. Override it with `SignInForm twoFactor`.
  - **OrganizationSwitcher `label` and `createLabel`**, so it can say Workspaces or Teams.
  - **`AuthRevalidator` / `useAuthRevalidation()`** for React Router data routers: pages guarded only by `protectedLoader` now redirect after an idle, cross-tab or server sign-out. `IdleWarningDialog onSignOut` also fires for the automatic idle sign-out, and the auth state records `lastSignOut`.
  - Docs cover the bearer-mode server contract (refresh rotation, two-step challenges, magic links, organizations) and the CORS headers a separate API origin needs.

  **UI**

  - Charts that start in a loading or empty state measure their width once data arrives (Funnel, Sankey and Heatmap used to keep a 480px fallback and overflow narrow cards).
  - Gauge inside ChartCard no longer shows its title twice.
  - DataTable phone cards, Alert, form errors, chart tooltips and tables, mega-menu link cards, FileUpload rows and Stepper steps use the container radius, so themes with pill-shaped controls (playful) don't turn them into ovals.
  - The DataTable phone-card list is named after the table.
  - `tableSearch(state)` builds a table URL for deep links; comma-joined values in hand-written links (`f.status=open,pending`) are read as separate filter values. The URL format is documented.
  - `SidebarHeader` grows with its content, so a switcher under the brand isn't clipped.
  - `StaggerItem` no longer needs `index`: it follows document order.

- [#27](https://github.com/khalmohak/glyph/pull/27) [`bc2af02`](https://github.com/khalmohak/glyph/commit/bc2af02637abcb99897f31764e417f6ce7596fa3) Thanks [@khalmohak](https://github.com/khalmohak)! - Bug fixes found in a full review of tokens, viewers and blocks.

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
