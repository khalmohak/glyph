import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Navbar',
  slug: 'navbar',
  category: 'Patterns',
  status: 'stable',
  description:
    'Site header built from data: brand, links and actions. Responsive, with a menu panel on small screens.',
  entry: '@glyphui/ui',
  exports: ['Navbar', 'navbarStyles'],
  source: 'patterns/app-shell/navbar.tsx',
  propsOf: 'Navbar',
  examples: [{ file: 'basic', title: 'Basic' }],
  notes: [
    'By default it is sticky and transparent, gaining a blurred background and border once the page scrolls.',
    'Links render through GlyphProvider linkComponent, so router navigation works.',
  ],
})
