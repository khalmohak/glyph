# @glyphui/tokens

## 0.8.2

### Patch Changes

- [#36](https://github.com/khalmohak/glyph/pull/36) [`c5bbf94`](https://github.com/khalmohak/glyph/commit/c5bbf947a4fa8f5e9bad9fb6d7eebdc36ff798d8) Thanks [@khalmohak](https://github.com/khalmohak)! - The docs moved to [glyphui.xyz](https://glyphui.xyz), with the demo apps at [demo.glyphui.xyz](https://demo.glyphui.xyz) and [auth.glyphui.xyz](https://auth.glyphui.xyz). Package homepages and README links point there; the old GitHub Pages links redirect.

## 0.8.1

## 0.8.0

### Patch Changes

- [#27](https://github.com/khalmohak/glyph/pull/27) [`bc2af02`](https://github.com/khalmohak/glyph/commit/bc2af02637abcb99897f31764e417f6ce7596fa3) Thanks [@khalmohak](https://github.com/khalmohak)! - Readable button text for custom brand colors. When a theme changes a solid tone (`primary`, `secondary`, `success`, `warning`, `danger`, `info`) without setting its `*-foreground`, and the inherited text color no longer reaches 4.5:1 on it, `defineTheme` now picks white or dark ink, whichever reads better. Values you set are kept. Status text colors (`*-text`) are also checked against `raised` surfaces (menus, popovers), fixing glyph's dark danger text in menus (4.49:1).

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

## 0.7.0

## 0.6.0

## 0.5.0

### Minor Changes

- [#20](https://github.com/khalmohak/glyph/pull/20) [`b6883cc`](https://github.com/khalmohak/glyph/commit/b6883cc45f159997c12c50ceb6a0564778e84cfe) Thanks [@khalmohak](https://github.com/khalmohak)! - Motion is on by default, and the theme controls it.

  - New theme keys: `motion.level` (`none`, `subtle` or `expressive`) and `motion.spring` (`{ stiffness, damping, mass? }`). The spring is compiled to a CSS `linear()` curve, so CSS and JavaScript animations move the same way: `--glyph-ease-spring` and `--glyph-duration-spring`, the `ease-spring` utility, and `springEasing()` in `@glyphui/tokens`. Brutalist snaps with no bounce; Playful is expressive.
  - `GlyphProvider` takes `motion` to override the level app-wide (e.g. `motion="none"` in tests). Visitors who prefer reduced motion never get animation. The level is mirrored to `<html data-motion>`, with `motion-none:` and `motion-expressive:` variants.
  - Menus, popovers, selects, tooltips and hover cards spring out of their trigger and animate out before unmounting. Dialogs, alert dialogs and the command menu rise in and settle out. Overlays fade in and out.
  - Sliding active indicators in Tabs, SegmentedControl, Sidebar and Pagination. Files in FileUpload and chips in TagInput animate in and out. The Switch thumb uses the theme spring, the Checkbox tick draws on when checked, and buttons press down.
  - New primitives: `Reveal`, `Stagger`/`StaggerItem`, `AnimatedNumber`, `PageTransition`, `Presence`, `ActiveIndicator`, `m` (from `motion`) and `useMotionSettings`. Content never depends on JavaScript to become visible.
  - Every block animates in on scroll; Stats count up and Pricing prices spring between monthly and yearly. Pass `animate={false}` to turn a block's entrance off.

### Patch Changes

- [#20](https://github.com/khalmohak/glyph/pull/20) [`b6883cc`](https://github.com/khalmohak/glyph/commit/b6883cc45f159997c12c50ceb6a0564778e84cfe) Thanks [@khalmohak](https://github.com/khalmohak)! - Smaller apps. `@glyphui/ui` now ships one file per module, so your bundler keeps only the components you import, and every style and theme definition is marked side-effect free.

  - Importing one component no longer pulls in every dependency. `Badge` alone went from 56 kB to 14 kB gzipped.
  - `GlyphProvider` loads the `useConfirm()` dialog the first time you call it, and the toast UI only when you turn on `toaster`. A provider plus a Button now loads 28 kB gzipped up front, down from 107 kB.

## 0.4.0

### Minor Changes

- [#18](https://github.com/khalmohak/glyph/pull/18) [`29a008a`](https://github.com/khalmohak/glyph/commit/29a008a30a1640ed9ace3cf512cbcc4bbd4ac484) Thanks [@khalmohak](https://github.com/khalmohak)! - Every preset now meets WCAG AA contrast in light and dark mode, and the docs pass an automated accessibility check with no exceptions.

  - New status text colors (`primary-text`, `success-text`, `warning-text`, `danger-text`, `info-text`) for links, field errors, Text tones and tinted badges. You don't have to set them: `defineTheme` derives each one from its tone so it stays readable, including on your own colors. Set one to override it.
  - New `auditContrast(theme)` in `@glyphui/tokens` lists every color pair in a theme that falls below WCAG AA. `contrastRatio()` is exported too.
  - Preset tweaks: lighter or darker hint text (`faint-foreground`), a deeper dark-mode blue and red behind white button text, darker light-mode success and info, chart colors that stand out against the page, and dark text on playful's mint and sky fills.
  - Calendar: days outside the month are no longer faded, and today's date keeps the selected style when picked.
  - Collapsed sidebar items keep their label for screen readers.
  - Slider takes its accessible name from the surrounding Field.
  - ScrollArea can be scrolled with the keyboard when its content overflows.
  - Charts no longer put focusable elements inside their hidden plot.
  - Pricing prices shrink to fit their card, and the plan badge wraps instead of being clipped.
  - LogoCloud wordmarks are readable.

- [#18](https://github.com/khalmohak/glyph/pull/18) [`29a008a`](https://github.com/khalmohak/glyph/commit/29a008a30a1640ed9ace3cf512cbcc4bbd4ac484) Thanks [@khalmohak](https://github.com/khalmohak)! - Fixes for the problems found while building a real app with Glyph.

  - **Router integration.** `<GlyphProvider router={reactRouter}>` (from the new `@glyphui/ui/react-router`) makes every Glyph link navigate client-side and marks the current Sidebar, Navbar and NavigationMenu item automatically. Pass `end` on index items; an explicit `active` prop still wins. Other routers pass `{ Link, useIsActive }`; the getting-started guide has TanStack Router and Next.js versions. `linkComponent` keeps working.
  - **Forms in modals.** `<FormSubmit form={form}>` works outside `<Form>`, for example in a Modal footer, instead of crashing. Without a form it now throws a clear error. `Modal` takes `onSubmit` for plain forms: the body and footer become one form, and a footer submit button works.
  - **No dark-mode flash with Vite.** The new `glyphColorMode()` plugin from `@glyphui/ui/vite` injects the color-mode script into `index.html`.
  - **Fonts.** `@import "@glyphui/ui/fonts.css"` loads Geist and Geist Mono, which the default theme uses.
  - **Chart palette.** Themes have five chart colors, `chart-1` to `chart-5`, and charts use them by default, so series no longer match your brand or status colors by accident. Every preset has its own palette. Themes that don't set chart colors fall back to primary, info, success, warning and danger, so existing themes keep working.
  - **Blocks stylesheet check.** If `@glyphui/blocks/styles.css` is missing, blocks warn once in the console during development, with the line to add.
  - `Field` takes `labelAction`, content beside the label that is not part of the control's name. AuthCard uses it, so the password field is named "Password" rather than "Password Forgot password?".
  - `SegmentedControl` takes its label from a surrounding `Field`, so `aria-label` is optional there.
  - Pricing: a free tier no longer shows "per month".
  - The data table still requires `@tanstack/react-table` version 8; install snippets now say `@tanstack/react-table@8`.

## 0.3.0

## 0.2.0

## 0.1.1

### Patch Changes

- [`7ea3b02`](https://github.com/khalmohak/glyph/commit/7ea3b022b384ff21be92438c86eda938e9c77f54) Thanks [@khalmohak](https://github.com/khalmohak)! - Publish with npm provenance, so every release links to the commit and workflow that built it.

## 0.1.0

### Minor Changes

- [`a13ee56`](https://github.com/khalmohak/glyph/commit/a13ee56d2ead4041d26dc94231fcb1e9dad3e56d) Thanks [@khalmohak](https://github.com/khalmohak)! - First public release. Theme engine with four presets (glyph, brutalist, editorial, playful), around 30 themed components on Radix, and the patterns: Form (Standard Schema), DataTable (TanStack Table), AppShell with Sidebar and Navbar, and Async states.
