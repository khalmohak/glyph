---
"@glyphui/tokens": patch
---

Readable button text for custom brand colors. When a theme changes a solid tone (`primary`, `secondary`, `success`, `warning`, `danger`, `info`) without setting its `*-foreground`, and the inherited text color no longer reaches 4.5:1 on it, `defineTheme` now picks white or dark ink, whichever reads better. Values you set are kept. Status text colors (`*-text`) are also checked against `raised` surfaces (menus, popovers), fixing glyph's dark danger text in menus (4.49:1).
