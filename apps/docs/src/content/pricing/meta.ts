import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Pricing',
  slug: 'pricing',
  category: 'Blocks',
  status: 'beta',
  description:
    'Plan comparison with features, call-to-action buttons and an optional monthly / yearly switch.',
  entry: '@glyphui/blocks',
  exports: ['Pricing'],
  propsOf: 'Pricing',
  examples: [
    {
      file: 'three-tiers',
      title: 'Three tiers',
      description: 'The billing switch appears when any tier has per-period prices.',
    },
    { file: 'two-tiers', title: 'Two tiers, custom format' },
  ],
  notes: [
    'Numeric prices go through formatPrice; strings such as “Custom” are shown as they are.',
    'A tier with cta.href renders a link through your router’s link component.',
  ],
})
