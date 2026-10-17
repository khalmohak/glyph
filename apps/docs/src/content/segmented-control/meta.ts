import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'SegmentedControl',
  slug: 'segmented-control',
  category: 'Forms',
  status: 'stable',
  description: 'Pick exactly one of a few options. The value type is inferred from the options.',
  entry: '@glyphui/ui',
  exports: ['SegmentedControl', 'segmentedControlStyles'],
  source: 'components/segmented-control/segmented-control.tsx',
  propsOf: 'SegmentedControl',
  radix: 'https://www.radix-ui.com/primitives/docs/components/toggle-group',
  examples: [
    { file: 'basic', title: 'Basic' },
    { file: 'full-width', title: 'Full width' },
  ],
  notes: ['Never deselects: clicking the active option keeps it selected.'],
  a11y: {
    keyboard: [
      { keys: 'Arrow Left or Arrow Right', action: 'Moves focus between options.' },
      { keys: 'Space or Enter', action: 'Selects the focused option.' },
    ],
    notes: [
      'Labelled by its Field label or aria-label; it warns in development when it has neither.',
      'The selected option is exposed with aria-checked, so screen readers announce which one is on.',
    ],
  },
})
