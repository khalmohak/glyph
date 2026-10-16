import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'PageHeader',
  slug: 'page-header',
  category: 'Patterns',
  status: 'stable',
  description:
    'The title block at the top of a page: optional eyebrow, title, description and actions.',
  entry: '@glyphui/ui',
  exports: ['PageHeader', 'pageHeaderStyles'],
  source: 'patterns/app-shell/page-header.tsx',
  propsOf: 'PageHeader',
  examples: [{ file: 'basic', title: 'With actions' }],
  notes: ['Renders the title as an h1; use one PageHeader per page.'],
})
