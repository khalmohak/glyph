---
"@glyphui/ui": minor
"@glyphui/tokens": minor
"@glyphui/blocks": minor
---

Fixes for the problems found while building a real app with Glyph.

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
