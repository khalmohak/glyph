---
"@glyphui/ui": patch
---

Bug fixes across components:

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
