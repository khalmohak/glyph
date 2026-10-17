---
"@glyphui/tokens": minor
"@glyphui/ui": minor
"@glyphui/blocks": patch
---

Every preset now meets WCAG AA contrast in light and dark mode, and the docs pass an automated accessibility check with no exceptions.

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
