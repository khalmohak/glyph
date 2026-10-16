---
"@glyphui/ui": minor
---

25 new components, all themed by tokens and registered for typed theme overrides:

- Overlays: Dialog, Sheet, Popover, DropdownMenu, AlertDialog with `useConfirm()` (`await confirm({ title, tone: 'danger' })`), and Toast (`toast()`, `toast.promise`).
- Navigation: Breadcrumb, Pagination, Link, CommandMenu with a ⌘K shortcut hook.
- Forms: RadioGroup (with option cards), Slider (single and range), Combobox (searchable, single or multiple, typed values).
- Feedback: Alert, Banner, Progress and ProgressCircle.
- Data display: Accordion, DescriptionList, StatCard.
- Typography: Code, CodeBlock, Blockquote, Prose.
- Layout: Grid, AspectRatio, ScrollArea.

GlyphProvider now provides `useConfirm()` everywhere and takes an optional `toaster` prop. Button supports `iconOnly` together with `asChild`.
