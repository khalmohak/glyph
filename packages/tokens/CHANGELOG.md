# @glyphui/tokens

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
