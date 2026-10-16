import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Sheet',
  slug: 'sheet',
  category: 'Overlays',
  status: 'beta',
  description:
    'A panel that slides in from any edge for filters, record details, settings or navigation.',
  entry: '@glyphui/ui',
  exports: [
    'Sheet',
    'SheetTrigger',
    'SheetContent',
    'SheetHeader',
    'SheetTitle',
    'SheetDescription',
    'SheetBody',
    'SheetFooter',
    'SheetClose',
    'sheetStyles',
  ],
  source: 'components/sheet/sheet.tsx',
  propsOf: 'SheetContentProps',
  radix: 'https://www.radix-ui.com/primitives/docs/components/dialog',
  examples: [
    { file: 'filters', title: 'Filters panel' },
    {
      file: 'sides',
      title: 'Sides',
      description: 'side sets the edge; size sets the width of left and right sheets.',
    },
  ],
  notes: [
    'It is a modal dialog: focus is trapped inside and returns to the trigger on close.',
    'SheetBody scrolls on its own, so the header and footer stay in view.',
  ],
})
