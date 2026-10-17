import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Switch',
  slug: 'switch',
  category: 'Forms',
  status: 'stable',
  description: 'An on/off toggle for settings that apply immediately.',
  entry: '@glyphui/ui',
  exports: ['Switch', 'switchStyles'],
  source: 'components/switch/switch.tsx',
  propsOf: 'Switch',
  radix: 'https://www.radix-ui.com/primitives/docs/components/switch',
  examples: [
    { file: 'settings', title: 'Settings list' },
    { file: 'sizes', title: 'Sizes' },
  ],
  notes: ['Use a Switch for instant settings and a Checkbox for choices submitted with a form.'],
  a11y: {
    keyboard: [{ keys: 'Space or Enter', action: 'Turns it on or off.' }],
    notes: ['Uses role="switch" with aria-checked, labelled by its Field label or aria-label.'],
  },
})
