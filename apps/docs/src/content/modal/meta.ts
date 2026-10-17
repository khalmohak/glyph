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
      description:
        'onSubmit turns the body and footer into one form, so a submit button in the footer works.',
    },
    {
      file: 'validated-form',
      title: 'With a validated form',
      description:
        'Schema validation with @glyphui/ui/form: <Form> in the body, <FormSubmit form={form}> in the footer.',
    },
  ],
  notes: [
    'Use Modal for most cases. Reach for the Dialog parts when you need a custom layout, AlertDialog or useConfirm() for yes/no decisions, and Sheet for side panels.',
    'The title is required: it becomes the modal’s accessible name.',
    'The footer sits outside the body, so a FormSubmit there needs form={form}; a plain submit button needs onSubmit on the Modal.',
    'Set closeOnOverlayClick={false} for forms where a stray click would lose input; Escape still closes.',
  ],
})
