---
"@glyphui/auth": patch
"@glyphui/blocks": patch
"@glyphui/viewers": patch
---

`@glyphui/ui`, `@glyphui/blocks` and `@glyphui/tokens` are now peer dependencies of `@glyphui/auth`, `@glyphui/blocks` and `@glyphui/viewers`, so your app and Glyph share one copy. As regular dependencies, a version mismatch installed a second copy of `@glyphui/ui` with its own React context, and components like `UserMenu` crashed with "must be used inside GlyphProvider". Keep all `@glyphui/*` packages on the same version.

`ForgotPasswordForm` copy now matches the reset method: with code-based resets it offers to send a code instead of a link.
