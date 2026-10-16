import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Modal',
  slug: 'modal',
  category: 'Overlays',
  status: 'beta',
  description:
    'The everyday modal in one component: pass a title, description, body and footer. Built on Dialog.',
  entry: '@glyphui/ui',
  exports: ['Modal', 'ModalClose', 'modalStyles'],
  source: 'components/modal/modal.tsx',
  propsOf: 'Modal',
  radix: 'https://www.radix-ui.com/primitives/docs/components/dialog',
  examples: [
    {
      file: 'basic',
      title: 'With a trigger',
      description: 'Pass the opening button as trigger; wrap footer buttons in ModalClose.',
    },
    {
      file: 'controlled',
      title: 'Controlled',
      description: 'Open it from code, e.g. after a row action or a keyboard shortcut.',
    },
    {
      file: 'form',
      title: 'With a form',
      description: 'Submit, then close when the save succeeds.',
    },
  ],
  notes: [
    'Use Modal for most cases. Reach for the Dialog parts when you need a custom layout, AlertDialog or useConfirm() for yes/no decisions, and Sheet for side panels.',
    'The title is required: it becomes the modal’s accessible name.',
    'Set closeOnOverlayClick={false} for forms where a stray click would lose input; Escape still closes.',
  ],
})
