import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Spinner',
  slug: 'spinner',
  category: 'Feedback',
  status: 'stable',
  description: 'An indeterminate loading indicator that inherits the current text color.',
  entry: '@glyphui/ui',
  exports: ['Spinner', 'spinnerStyles'],
  source: 'components/spinner/spinner.tsx',
  propsOf: 'Spinner',
  examples: [
    { file: 'sizes', title: 'Sizes' },
    {
      file: 'labelled',
      title: 'With a label',
      description: 'Pass label when the spinner is the only signal that something is loading.',
    },
  ],
})
