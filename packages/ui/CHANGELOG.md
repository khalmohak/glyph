# @glyphui/ui

## 0.8.2

### Patch Changes

- [#36](https://github.com/khalmohak/glyph/pull/36) [`c5bbf94`](https://github.com/khalmohak/glyph/commit/c5bbf947a4fa8f5e9bad9fb6d7eebdc36ff798d8) Thanks [@khalmohak](https://github.com/khalmohak)! - The docs moved to [glyphui.xyz](https://glyphui.xyz), with the demo apps at [demo.glyphui.xyz](https://demo.glyphui.xyz) and [auth.glyphui.xyz](https://auth.glyphui.xyz). Package homepages and README links point there; the old GitHub Pages links redirect.

- Updated dependencies [[`c5bbf94`](https://github.com/khalmohak/glyph/commit/c5bbf947a4fa8f5e9bad9fb6d7eebdc36ff798d8)]:
  - @glyphui/tokens@0.8.2

## 0.8.1

### Patch Changes

- [#31](https://github.com/khalmohak/glyph/pull/31) [`fc323a7`](https://github.com/khalmohak/glyph/commit/fc323a7daeaefe1b107bc1f04936acdf2192535b) Thanks [@khalmohak](https://github.com/khalmohak)! - Charts and data tables measure again once web fonts finish loading. A chart's y-axis width and a table's pinned-column offsets were measured with the fallback font when the real one arrived late, so they could stay slightly off (and render differently from one page load to the next).

- Updated dependencies []:
  - @glyphui/tokens@0.8.1

## 0.8.0

### Patch Changes

- [#27](https://github.com/khalmohak/glyph/pull/27) [`bc2af02`](https://github.com/khalmohak/glyph/commit/bc2af02637abcb99897f31764e417f6ce7596fa3) Thanks [@khalmohak](https://github.com/khalmohak)! - Fixes from building a real app with Glyph (Ledgerline):

  - **NumberInput no longer corrupts amounts.** Tabbing into a formatted value like "$90,000.00" and typing used to append (giving $900,001,250); keyboard focus now selects the whole number so typing replaces it. NumberInput also reports the value while you type, so form errors clear before you click Submit instead of moving the button out from under the click. Clamping and rounding still happen on blur.
  - **Shared table links with one filter value work.** `useTableUrlState` (and `parseTableSearch`) take your `columns` and decode each filter by its type, so `?f.status=overdue` gives a `multi` filter `['overdue']`, not a string. DataTable always reports `multi` filters as arrays, and the new `getFilterList(filters, id)` reads a filter as an array for server-side fetches.
  - **Menus no longer hide the page from screen readers.** `DropdownMenu` and `ContextMenu` are now non-modal by default: focus still moves into the menu and Escape or an outside click closes it, but the rest of the page isn't marked `aria-hidden` while staying focusable. Pass `modal` for the old behavior.
  - **Contrast warnings in development.** `GlyphProvider` logs once per theme when its colors fail WCAG contrast, naming each pair. `auditContrast` and `contrastRatio` are now exported from `@glyphui/ui`.
  - **Tab panels show focus.** A tab panel that takes keyboard focus now gets the focus ring.
  - **InputOTP fits phones.** Slots and gaps are one step smaller below `sm`, so eight slots fit a 390px screen.
  - **Headings wrap long words** instead of overflowing narrow screens.

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

- [#27](https://github.com/khalmohak/glyph/pull/27) [`bc2af02`](https://github.com/khalmohak/glyph/commit/bc2af02637abcb99897f31764e417f6ce7596fa3) Thanks [@khalmohak](https://github.com/khalmohak)! - Bug fixes across components:

  - **NumberInput** reads the locale's decimal comma ("1.234,5" is 1234.5 with `locale="de-DE"`), keeps showing the raw number while focused after arrow keys or the − / + buttons (instead of switching to the formatted "$2.00"), and no longer calls `onValueChange` when you leave the field without changing it.
  - **TagInput** no longer adds a tag when Enter confirms an IME candidate (Japanese, Chinese, Korean input). When `maxTags` is reached the field stays focused and read-only, so Backspace can still remove the last tag; before, it was disabled and focus was lost.
  - **Slider** with `showValue` and no `value` now updates the shown number as you drag or use arrow keys.
  - **Carousel** arrow keys no longer hijack text fields, selects and sliders inside a slide, and your own `onKeyDownCapture` on the carousel, or `onClick` on CarouselPrevious / CarouselNext, now runs alongside Glyph's instead of replacing it.
  - **TreeView** keeps its keyboard navigation when you pass your own `onKeyDown`.
  - **Button** with `asChild` and `disabled` or `loading` now really disables the link it renders: `aria-disabled`, out of the tab order, click prevented.
  - **useCommandMenuShortcut** no longer throws on keydown events without a key (Chrome autofill), and holding ⌘K no longer toggles the menu repeatedly.
  - **Color mode** follows a change made in another tab.
  - **Avatar** initials keep emoji and other multi-byte characters whole.
  - **FileUpload** lists two rejected files with the same name without a React key warning.
  - `useControllableState` (used by most inputs) applies several functional updates in one event correctly and returns a stable setter.
  - DatePicker and DateRangePicker: the clear control is now a real button beside the trigger instead of a fake button nested inside it, so screen readers announce both correctly, and focus returns to the picker after clearing.

- [#27](https://github.com/khalmohak/glyph/pull/27) [`bc2af02`](https://github.com/khalmohak/glyph/commit/bc2af02637abcb99897f31764e417f6ce7596fa3) Thanks [@khalmohak](https://github.com/khalmohak)! - Bug fixes for tables, charts, layout, motion and router integration.

  - **DataTable:**
    - In server mode, "Select all 312" now survives moving to another page.
    - When the server total shrinks below the current page (say, after deleting every row on the last page), the table moves back to the last page instead of showing an empty one.
    - Sorting or filters for a column that no longer exists (an old shared URL, say) are ignored instead of logging errors on every render.
    - CSV export now escapes a formula at the start of a list cell, like a tags column.
  - **Table URL state:** a search still being typed no longer overwrites the page the user navigated to with the back or forward button.
  - **Charts:**
    - Gaps in data (`null` or missing values) show as "—" in the accessible data table instead of `0` or `NaN`.
    - Legends ignore hidden keys for series, slices or groups that have gone away, and never leave a chart with everything hidden.
    - Heatmap skips invalid dates instead of drawing an empty grid.
  - **AppShell and Navbar:**
    - The mobile drawer and menu panel close when the window grows to desktop width.
    - Using an action in the Navbar's mobile panel closes it.
    - Links that share an `href` no longer trigger React key warnings.
  - **`useAsync`:** a function that throws before returning a promise now produces an error state instead of crashing.
  - **Motion:**
    - `PageTransition` no longer replays its entrance when the first page re-renders.
    - `AnimatedNumber` shows `NaN` or `Infinity` values directly instead of animating them.
  - **React Router:**
    - Relative `href`s (like `"invoices"` under `/app`) are marked active.
    - Table URL writes through `useRouterUrlAdapter()` keep the location hash.

- Updated dependencies [[`bc2af02`](https://github.com/khalmohak/glyph/commit/bc2af02637abcb99897f31764e417f6ce7596fa3), [`bc2af02`](https://github.com/khalmohak/glyph/commit/bc2af02637abcb99897f31764e417f6ce7596fa3)]:
  - @glyphui/tokens@0.8.0

## 0.7.0

### Patch Changes

- [#24](https://github.com/khalmohak/glyph/pull/24) [`b746553`](https://github.com/khalmohak/glyph/commit/b746553b4d380dc7a2a523251b734128a9495b61) Thanks [@khalmohak](https://github.com/khalmohak)! - `DropdownMenuItem` supports `asChild`, so an item can be a router link while keeping its icon and shortcut.

- Updated dependencies []:
  - @glyphui/tokens@0.7.0

## 0.6.0

### Minor Changes

- [#22](https://github.com/khalmohak/glyph/pull/22) [`ce9fb2a`](https://github.com/khalmohak/glyph/commit/ce9fb2a5c41f92b6bdd26bd3c5cf6308310d3596) Thanks [@khalmohak](https://github.com/khalmohak)! - DataTable v2: the table SaaS apps need, still a drop-in for the 0.5 API.

  - **Server mode.** `mode="server"` with `rowCount` hands paging, sorting, search and filters to your API through `onStateChange`. The current rows stay on screen under a thin progress bar while the next page loads. Cursor APIs pass `hasNextPage`; infinite lists pass `onLoadMore`.
  - **Controlled state.** Every slice (page, sort, search, filters, hidden columns, sizes, pinning, order, selection, expanded rows, density) can be controlled through `state` and `onStateChange`, or left to the table. `onSortingChange`, `onPaginationChange`, `onSearchChange` and `onColumnFiltersChange` report single slices.
  - **State in the URL.** `useTableUrlState()` keeps the view shareable and the back button working, with any router; one user action is one history entry. With React Router, pass `adapter: useRouterUrlAdapter()` from `@glyphui/ui/react-router`.
  - **Filter chips.** Declare `meta.filter` on a column (`select`, `multi` with match counts, `range`, `date-range`, `text`) and the toolbar gets a Filter menu and Linear-style chips. The editors load on first use.
  - **Sorting and pages.** Shift-click to sort by several columns, with the order shown in the headers. Page numbers, first and last, and a rows-per-page menu.
  - **Selection.** "Select all 312" selects every matching row across pages (`allMatchingSelected` in server mode), and `bulkActions` shows your actions in a floating bar.
  - **Columns.** `columnControls` adds hiding (a View menu and a menu on each column), drag and keyboard resizing, pinning with sticky columns, and drag or keyboard reordering. `densityToggle` adds compact, default and comfortable; themes can set the default density.
  - **Rows.** `onRowClick` and `getRowHref` (a real link, so keyboard and middle-click work) without stealing clicks from buttons or checkboxes inside; `renderSubRow` for expandable details.
  - **Inline editing.** `editableCell()` edits text, numbers or choices in place. `onCellEdit` saves; the cell shows the new value at once and rolls back if saving fails.
  - **CSV export.** `exportCsv` adds an Export menu (this page, selected rows, all rows); `exportTableCsv()` and `toCsv()` export without a table. Quoting follows RFC 4180, and text that looks like a formula is neutralized.
  - **Phones and big data.** `mobile="cards"` shows rows as cards below 640px. `virtualRows()` from the new `@glyphui/ui/data-table/virtual` renders only visible rows for 10,000+ (needs `@tanstack/react-virtual`).
  - **Fixes.** When `data` changes, selections of rows that still exist are kept (with `getRowId`) and the page stays in range.

### Patch Changes

- Updated dependencies []:
  - @glyphui/tokens@0.6.0

## 0.5.0

### Minor Changes

- [#20](https://github.com/khalmohak/glyph/pull/20) [`b6883cc`](https://github.com/khalmohak/glyph/commit/b6883cc45f159997c12c50ceb6a0564778e84cfe) Thanks [@khalmohak](https://github.com/khalmohak)! - Charts v2 in `@glyphui/ui/chart`.

  - New chart types: `PieChart` (with slice labels; `DonutChart` is now a pie with a hole), `RadarChart`, `RadialBarChart`, `ScatterChart` (bubbles with `size`, groups with `groupBy`), `ComposedChart` (bars, lines and areas, with an optional right axis), `FunnelChart`, `Treemap`, `SankeyChart`, `Gauge` (with colored bands, read out as a meter) and `Heatmap` (a calendar of days you can move through with the arrow keys).
  - Line, area, bar and composed charts get an interactive legend (click or press Enter to hide a series), `brush` to zoom, `referenceLines` and `referenceAreas`, axis options (`xAxis`, `yAxis`), `syncId`, `onPointClick`, a total row in stacked tooltips, horizontal bars (`layout="vertical"`) and 100% stacked areas (`expand`). The y axis now sizes itself to its labels.
  - Every chart takes `loading`, `error` with `onRetry`, and `empty`, like the other data components.
  - Charts animate in and when data changes, at the theme's motion level, and stay still for visitors who prefer reduced motion.
  - `ChartCard`: a card with a period selector, a "view as table" toggle and a PNG/SVG download menu.
  - `exportChart(element, { format })` downloads any chart as PNG or SVG with its title, legend and theme colors baked in.
  - `Sparkline` gains `variant` (`area`, `line`, `bar`) and `showMinMax`.
  - Fix: a chart color that your own code never mentioned (often `chart-4`) rendered black, because Tailwind only emits theme variables it finds in your source. Charts now use the theme's `--glyph-*` variables directly.

- [#20](https://github.com/khalmohak/glyph/pull/20) [`b6883cc`](https://github.com/khalmohak/glyph/commit/b6883cc45f159997c12c50ceb6a0564778e84cfe) Thanks [@khalmohak](https://github.com/khalmohak)! - Motion is on by default, and the theme controls it.

  - New theme keys: `motion.level` (`none`, `subtle` or `expressive`) and `motion.spring` (`{ stiffness, damping, mass? }`). The spring is compiled to a CSS `linear()` curve, so CSS and JavaScript animations move the same way: `--glyph-ease-spring` and `--glyph-duration-spring`, the `ease-spring` utility, and `springEasing()` in `@glyphui/tokens`. Brutalist snaps with no bounce; Playful is expressive.
  - `GlyphProvider` takes `motion` to override the level app-wide (e.g. `motion="none"` in tests). Visitors who prefer reduced motion never get animation. The level is mirrored to `<html data-motion>`, with `motion-none:` and `motion-expressive:` variants.
  - Menus, popovers, selects, tooltips and hover cards spring out of their trigger and animate out before unmounting. Dialogs, alert dialogs and the command menu rise in and settle out. Overlays fade in and out.
  - Sliding active indicators in Tabs, SegmentedControl, Sidebar and Pagination. Files in FileUpload and chips in TagInput animate in and out. The Switch thumb uses the theme spring, the Checkbox tick draws on when checked, and buttons press down.
  - New primitives: `Reveal`, `Stagger`/`StaggerItem`, `AnimatedNumber`, `PageTransition`, `Presence`, `ActiveIndicator`, `m` (from `motion`) and `useMotionSettings`. Content never depends on JavaScript to become visible.
  - Every block animates in on scroll; Stats count up and Pricing prices spring between monthly and yearly. Pass `animate={false}` to turn a block's entrance off.

- [#20](https://github.com/khalmohak/glyph/pull/20) [`b6883cc`](https://github.com/khalmohak/glyph/commit/b6883cc45f159997c12c50ceb6a0564778e84cfe) Thanks [@khalmohak](https://github.com/khalmohak)! - Smaller apps. `@glyphui/ui` now ships one file per module, so your bundler keeps only the components you import, and every style and theme definition is marked side-effect free.

  - Importing one component no longer pulls in every dependency. `Badge` alone went from 56 kB to 14 kB gzipped.
  - `GlyphProvider` loads the `useConfirm()` dialog the first time you call it, and the toast UI only when you turn on `toaster`. A provider plus a Button now loads 28 kB gzipped up front, down from 107 kB.

### Patch Changes

- Updated dependencies [[`b6883cc`](https://github.com/khalmohak/glyph/commit/b6883cc45f159997c12c50ceb6a0564778e84cfe), [`b6883cc`](https://github.com/khalmohak/glyph/commit/b6883cc45f159997c12c50ceb6a0564778e84cfe)]:
  - @glyphui/tokens@0.5.0

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

### Patch Changes

- Updated dependencies [[`29a008a`](https://github.com/khalmohak/glyph/commit/29a008a30a1640ed9ace3cf512cbcc4bbd4ac484), [`29a008a`](https://github.com/khalmohak/glyph/commit/29a008a30a1640ed9ace3cf512cbcc4bbd4ac484)]:
  - @glyphui/tokens@0.4.0

## 0.3.0

### Minor Changes

- [#16](https://github.com/khalmohak/glyph/pull/16) [`4d0a17e`](https://github.com/khalmohak/glyph/commit/4d0a17ee9090d9bed8b809243036ae74328397f4) Thanks [@khalmohak](https://github.com/khalmohak)! - The roadmap ships: 25 more components and the first release of @glyphui/blocks.

  - Forms: Calendar, DatePicker and DateRangePicker (with presets), InputOTP, NumberInput, TagInput, PasswordInput (with strength meter), FileUpload (dropzone, validation, progress).
  - Overlays: Modal (the simple, prop-driven modal), ContextMenu, HoverCard.
  - Navigation: NavigationMenu (mega menus), Stepper.
  - Actions: Toggle and ToggleGroup, CopyButton.
  - Data display: Timeline, TreeView, Carousel, Collapsible.
  - Layout: Resizable panels, VisuallyHidden.
  - Charts at `@glyphui/ui/chart`: LineChart, AreaChart, BarChart, DonutChart and Sparkline, colored by theme tokens, with a screen-reader data table. recharts is an optional peer dependency.
  - `@glyphui/blocks`: Hero, LogoCloud, FeatureGrid, FeatureSplit, Stats, Pricing, Testimonials, Faq, Cta, Newsletter, SiteFooter, AuthCard, SectionHeader.

  Sheet now slides in and out from every edge, and Accordion and Collapsible animate their height when opening and closing.

### Patch Changes

- Updated dependencies []:
  - @glyphui/tokens@0.3.0

## 0.2.0

### Minor Changes

- [#14](https://github.com/khalmohak/glyph/pull/14) [`dcac22c`](https://github.com/khalmohak/glyph/commit/dcac22c01ca3fa45bd4bf300df62ff255cd31c92) Thanks [@khalmohak](https://github.com/khalmohak)! - 25 new components, all themed by tokens and registered for typed theme overrides:

  - Overlays: Dialog, Sheet, Popover, DropdownMenu, AlertDialog with `useConfirm()` (`await confirm({ title, tone: 'danger' })`), and Toast (`toast()`, `toast.promise`).
  - Navigation: Breadcrumb, Pagination, Link, CommandMenu with a ⌘K shortcut hook.
  - Forms: RadioGroup (with option cards), Slider (single and range), Combobox (searchable, single or multiple, typed values).
  - Feedback: Alert, Banner, Progress and ProgressCircle.
  - Data display: Accordion, DescriptionList, StatCard.
  - Typography: Code, CodeBlock, Blockquote, Prose.
  - Layout: Grid, AspectRatio, ScrollArea.

  GlyphProvider now provides `useConfirm()` everywhere and takes an optional `toaster` prop. Button supports `iconOnly` together with `asChild`.

### Patch Changes

- [#13](https://github.com/khalmohak/glyph/pull/13) [`366a4ab`](https://github.com/khalmohak/glyph/commit/366a4ab9cc414741181386c5dd0ab33e3b6415cc) Thanks [@khalmohak](https://github.com/khalmohak)! - Badge no longer stretches to full width inside flex-column containers such as Card.

- Updated dependencies []:
  - @glyphui/tokens@0.2.0

## 0.1.1

### Patch Changes

- [`7ea3b02`](https://github.com/khalmohak/glyph/commit/7ea3b022b384ff21be92438c86eda938e9c77f54) Thanks [@khalmohak](https://github.com/khalmohak)! - Publish with npm provenance, so every release links to the commit and workflow that built it.

- Updated dependencies [[`7ea3b02`](https://github.com/khalmohak/glyph/commit/7ea3b022b384ff21be92438c86eda938e9c77f54)]:
  - @glyphui/tokens@0.1.1

## 0.1.0

### Minor Changes

- [`a13ee56`](https://github.com/khalmohak/glyph/commit/a13ee56d2ead4041d26dc94231fcb1e9dad3e56d) Thanks [@khalmohak](https://github.com/khalmohak)! - First public release. Theme engine with four presets (glyph, brutalist, editorial, playful), around 30 themed components on Radix, and the patterns: Form (Standard Schema), DataTable (TanStack Table), AppShell with Sidebar and Navbar, and Async states.

### Patch Changes

- Updated dependencies [[`a13ee56`](https://github.com/khalmohak/glyph/commit/a13ee56d2ead4041d26dc94231fcb1e9dad3e56d)]:
  - @glyphui/tokens@0.1.0
