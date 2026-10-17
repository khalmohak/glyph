import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Combobox',
  slug: 'combobox',
  category: 'Forms',
  status: 'beta',
  description:
    'A select with search for long option lists. Single or multiple values; the value type comes from your options.',
  entry: '@glyphui/ui',
  exports: ['Combobox', 'comboboxStyles'],
  source: 'components/combobox/combobox.tsx',
  propsOf: 'ComboboxProps',
  examples: [
    { file: 'basic', title: 'Searchable select' },
    {
      file: 'multiple',
      title: 'Multiple',
      description: 'Selected values show as chips; the list stays open.',
    },
  ],
  notes: [
    'Built on cmdk and Radix Popover: type to filter, arrow keys to move, Enter to choose, Escape to close.',
    'Search matches the label and any keywords you add to an option.',
    'Pass name to submit the value with a native form.',
  ],
  a11y: {
    keyboard: [
      {
        keys: 'Enter or Space',
        action: 'On the trigger: opens the list with focus in the search box.',
      },
      { keys: 'Typing', action: 'Filters the options.' },
      { keys: 'Arrow Down or Arrow Up', action: 'Moves the highlighted option.' },
      { keys: 'Enter', action: 'Selects the highlighted option (toggles it when multiple).' },
      { keys: 'Esc', action: 'Closes the list and returns focus to the trigger.' },
    ],
    notes: [
      'The list is a listbox; the highlighted option is announced through aria-activedescendant.',
    ],
  },
})
