import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'LogoCloud',
  slug: 'logo-cloud',
  category: 'Blocks',
  status: 'beta',
  description:
    'A row of customer or partner logos, muted so they support the page rather than compete with it.',
  entry: '@glyphui/blocks',
  exports: ['LogoCloud'],
  propsOf: 'LogoCloud',
  examples: [{ file: 'basic', title: 'Customer logos' }],
  notes: [
    'Pass { name, logo } so each logo gets an accessible name, even when the logo is an SVG.',
  ],
})
