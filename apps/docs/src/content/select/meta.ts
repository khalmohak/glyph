import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Select',
  slug: 'select',
  category: 'Forms',
  status: 'stable',
  description: 'A dropdown for choosing one option from a short list. The value type is generic.',
  entry: '@glyphui/ui',
  exports: ['Select', 'SelectItem', 'selectStyles'],
  source: 'components/select/select.tsx',
  propsOf: 'Select',
  radix: 'https://www.radix-ui.com/primitives/docs/components/select',
  examples: [
    { file: 'basic', title: 'In a field' },
    {
      file: 'typed',
      title: 'Typed values',
      description: 'Select<Plan> only accepts and emits Plan values.',
    },
  ],
  notes: ['For long lists or search, use Combobox.'],
  a11y: {
    keyboard: [
      {
        keys: 'Space or Enter or Arrow Down or Arrow Up',
        action: 'On the trigger: opens the list on the selected option.',
      },
      { keys: 'Arrow Down or Arrow Up', action: 'Moves between options.' },
      { keys: 'Home or End', action: 'Moves to the first or last option.' },
      { keys: 'Enter or Space', action: 'Selects the focused option and closes the list.' },
      { keys: 'Esc', action: 'Closes the list without changing the value.' },
      { keys: 'Letter keys', action: 'Typeahead: jumps to the matching option.' },
    ],
    notes: [
      'The trigger is a combobox button labelled by its Field label or aria-label.',
      "Radix Select is always modal while open; this is the one documented exception to Glyph's non-modal menus.",
    ],
  },
})
