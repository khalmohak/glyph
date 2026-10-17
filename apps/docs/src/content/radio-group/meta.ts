import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'RadioGroup',
  slug: 'radio-group',
  category: 'Forms',
  status: 'beta',
  description:
    'Pick exactly one option from a short visible list. The card variant makes each option a selectable card.',
  entry: '@glyphui/ui',
  exports: ['RadioGroup', 'RadioGroupItem', 'radioGroupStyles'],
  source: 'components/radio-group/radio-group.tsx',
  propsOf: 'RadioGroupProps',
  radix: 'https://www.radix-ui.com/primitives/docs/components/radio-group',
  examples: [
    { file: 'basic', title: 'Basic' },
    {
      file: 'cards',
      title: 'Option cards',
      description: 'variant="card" for plans, shipping methods and other rich choices.',
    },
  ],
  notes: [
    'Arrow keys move between options; the value type is inferred, so onValueChange receives your union type.',
    'Wrap in Field to get a label, description and error wired to the group.',
  ],
  a11y: {
    keyboard: [
      { keys: 'Tab', action: 'Moves into the group, onto the checked option (or the first).' },
      { keys: 'Arrow Down or Arrow Right', action: 'Checks the next option.' },
      { keys: 'Arrow Up or Arrow Left', action: 'Checks the previous option.' },
    ],
    notes: ['Uses role="radiogroup" and radio; only the checked option is a Tab stop.'],
  },
})
