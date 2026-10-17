---
"@glyphui/ui": patch
---

Fixes from building a real app with Glyph (Ledgerline):

- **NumberInput no longer corrupts amounts.** Tabbing into a formatted value like "$90,000.00" and typing used to append (giving $900,001,250); keyboard focus now selects the whole number so typing replaces it. NumberInput also reports the value while you type, so form errors clear before you click Submit instead of moving the button out from under the click. Clamping and rounding still happen on blur.
- **Shared table links with one filter value work.** `useTableUrlState` (and `parseTableSearch`) take your `columns` and decode each filter by its type, so `?f.status=overdue` gives a `multi` filter `['overdue']`, not a string. DataTable always reports `multi` filters as arrays, and the new `getFilterList(filters, id)` reads a filter as an array for server-side fetches.
- **Menus no longer hide the page from screen readers.** `DropdownMenu` and `ContextMenu` are now non-modal by default: focus still moves into the menu and Escape or an outside click closes it, but the rest of the page isn't marked `aria-hidden` while staying focusable. Pass `modal` for the old behavior.
- **Contrast warnings in development.** `GlyphProvider` logs once per theme when its colors fail WCAG contrast, naming each pair. `auditContrast` and `contrastRatio` are now exported from `@glyphui/ui`.
- **Tab panels show focus.** A tab panel that takes keyboard focus now gets the focus ring.
- **InputOTP fits phones.** Slots and gaps are one step smaller below `sm`, so eight slots fit a 390px screen.
- **Headings wrap long words** instead of overflowing narrow screens.
