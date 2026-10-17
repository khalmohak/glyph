import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Dialog',
  slug: 'dialog',
  category: 'Overlays',
  status: 'beta',
  description: 'A modal window for focused tasks such as editing a record or filling a short form.',
  entry: '@glyphui/ui',
  exports: [
    'Dialog',
    'DialogTrigger',
    'DialogContent',
    'DialogHeader',
    'DialogTitle',
    'DialogDescription',
    'DialogBody',
    'DialogFooter',
    'DialogClose',
    'dialogStyles',
  ],
  source: 'components/dialog/dialog.tsx',
  propsOf: 'DialogContentProps',
  radix: 'https://www.radix-ui.com/primitives/docs/components/dialog',
  examples: [
    { file: 'basic', title: 'Edit form' },
    {
      file: 'sizes',
      title: 'Sizes',
      description: 'sm, md (default), lg and xl set the maximum width.',
    },
  ],
  notes: [
    'Focus moves into the dialog on open, is trapped while open, and returns to the trigger on close.',
    'Always render a DialogTitle; it becomes the dialog’s accessible name.',
    'Escape and clicking the backdrop close it. For decisions that must not be dismissed by accident, use AlertDialog.',
  ],
  a11y: {
    keyboard: [
      { keys: 'Space or Enter', action: 'On the trigger: opens it and moves focus inside.' },
      {
        keys: 'Tab',
        action: 'Moves to the next focusable element inside; focus stays trapped while it is open.',
      },
      { keys: 'Shift + Tab', action: 'Moves to the previous focusable element inside.' },
      { keys: 'Esc', action: 'Closes it and returns focus to the trigger.' },
    ],
    notes: [
      'Uses role="dialog" with aria-modal; the title labels it and the description describes it.',
      "Content outside is hidden from screen readers and can't be scrolled while it is open.",
    ],
  },
})
