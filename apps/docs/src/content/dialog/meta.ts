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
})
