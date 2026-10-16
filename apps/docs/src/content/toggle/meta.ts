import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Toggle',
  slug: 'toggle',
  category: 'Actions',
  status: 'beta',
  description:
    'A two-state button, and ToggleGroup for toolbars: single choice like alignment or multiple like bold and italic.',
  entry: '@glyphui/ui',
  exports: ['Toggle', 'ToggleGroup', 'ToggleGroupItem', 'toggleStyles'],
  source: 'components/toggle/toggle.tsx',
  propsOf: 'Toggle',
  radix: 'https://www.radix-ui.com/primitives/docs/components/toggle-group',
  examples: [
    {
      file: 'toolbar',
      title: 'Formatting toolbar',
      description: 'type="multiple" for independent options, type="single" for one choice.',
    },
    { file: 'single', title: 'Single toggle' },
    { file: 'sizes', title: 'Variants and sizes' },
  ],
  notes: [
    'Icon-only toggles need an aria-label.',
    'Use Switch for settings that apply immediately and SegmentedControl for switching views; Toggle fits editor toolbars.',
  ],
})
