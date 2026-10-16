# @glyphui/ui

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
