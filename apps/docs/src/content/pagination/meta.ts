import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Pagination',
  slug: 'pagination',
  category: 'Navigation',
  status: 'beta',
  description: 'Moves between pages of a long list. Controlled, with buttons or real links.',
  entry: '@glyphui/ui',
  exports: ['Pagination', 'paginationRange', 'paginationStyles'],
  source: 'components/pagination/pagination.tsx',
  propsOf: 'PaginationProps',
  examples: [
    { file: 'basic', title: 'Controlled' },
    {
      file: 'links',
      title: 'As links',
      description: 'getHref renders links, so each page has a URL and works without JavaScript.',
    },
    {
      file: 'range',
      title: 'Range helper',
      description: 'paginationRange is exported for custom pagers.',
    },
  ],
  notes: [
    'The number of items stays constant while paging, so the control never jumps in width.',
    'The current page is marked with aria-current="page"; ellipses are hidden from screen readers.',
  ],
})
