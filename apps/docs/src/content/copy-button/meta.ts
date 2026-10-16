import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'CopyButton',
  slug: 'copy-button',
  category: 'Actions',
  status: 'beta',
  description:
    'Copies a value to the clipboard and confirms it with a check and a screen-reader announcement.',
  entry: '@glyphui/ui',
  exports: ['CopyButton', 'copyButtonStyles'],
  source: 'components/copy-button/copy-button.tsx',
  propsOf: 'CopyButton',
  examples: [
    { file: 'api-key', title: 'Next to a value' },
    { file: 'labelled', title: 'With a label' },
  ],
  notes: [
    'Without children it is icon-only and labelled "Copy"; pass aria-label to say what is copied.',
    'If the browser blocks clipboard access, nothing changes, so keep the value visible and selectable.',
    'Accepts Button variants and sizes; defaults to outline.',
  ],
})
