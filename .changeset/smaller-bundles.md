---
"@glyphui/ui": minor
"@glyphui/tokens": patch
"@glyphui/blocks": patch
---

Smaller apps. `@glyphui/ui` now ships one file per module, so your bundler keeps only the components you import, and every style and theme definition is marked side-effect free.

- Importing one component no longer pulls in every dependency. `Badge` alone went from 56 kB to 14 kB gzipped.
- `GlyphProvider` loads the `useConfirm()` dialog the first time you call it, and the toast UI only when you turn on `toaster`. A provider plus a Button now loads 28 kB gzipped up front, down from 107 kB.
