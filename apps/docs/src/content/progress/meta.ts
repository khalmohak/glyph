import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Progress',
  slug: 'progress',
  category: 'Feedback',
  status: 'beta',
  description:
    'A bar or ring showing how far a task has got, or an indeterminate bar while the length is unknown.',
  entry: '@glyphui/ui',
  exports: ['Progress', 'ProgressCircle', 'progressStyles', 'progressCircleStyles'],
  source: 'components/progress/progress.tsx',
  propsOf: 'ProgressProps',
  radix: 'https://www.radix-ui.com/primitives/docs/components/progress',
  examples: [
    { file: 'bar', title: 'Bar with label' },
    { file: 'tones', title: 'Sizes and tones' },
    {
      file: 'circle',
      title: 'Ring',
      description: 'ProgressCircle for compact spaces such as table cells and cards.',
    },
    {
      file: 'indeterminate',
      title: 'Indeterminate',
      description: 'Omit value while the total is unknown.',
    },
  ],
  notes: [
    'The visible label becomes the accessible name. Without one, pass aria-label.',
    'aria-valuetext uses formatValue, so screen readers hear "3 of 5 files" if that is what you show.',
  ],
})
