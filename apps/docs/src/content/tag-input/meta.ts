import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'TagInput',
  slug: 'tag-input',
  category: 'Forms',
  status: 'beta',
  description:
    'A free-form multi-value input: Enter or a comma turns text into removable tags. Good for labels, emails and keywords.',
  entry: '@glyphui/ui',
  exports: ['TagInput', 'tagInputStyles'],
  source: 'components/tag-input/tag-input.tsx',
  propsOf: 'TagInput',
  examples: [
    { file: 'basic', title: 'Keywords' },
    {
      file: 'validate',
      title: 'Validation and limits',
      description:
        'Reject tags with validate; stop at maxTags. Paste a comma-separated list to add several.',
    },
  ],
  notes: [
    'Backspace in an empty input removes the last tag.',
    'Each remove button is labelled “Remove <tag>” for screen readers.',
  ],
  a11y: {
    keyboard: [
      { keys: 'Enter or ,', action: 'Adds the typed tag.' },
      { keys: 'Backspace', action: 'On an empty input: removes the last tag.' },
    ],
    notes: [
      "Each tag's remove button is labelled with the tag's text.",
      'When full, the input becomes read-only rather than disabled, so it stays focusable.',
    ],
  },
})
