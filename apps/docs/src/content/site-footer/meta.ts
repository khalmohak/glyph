import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'SiteFooter',
  slug: 'site-footer',
  category: 'Blocks',
  status: 'beta',
  description: 'Site-wide footer with brand, link columns, copyright and social links.',
  entry: '@glyphui/blocks',
  exports: ['SiteFooter'],
  propsOf: 'SiteFooter',
  examples: [{ file: 'basic', title: 'Columns and socials' }],
  notes: ['Each column is a navigation landmark named by its title.'],
})
