import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Breadcrumb',
  slug: 'breadcrumb',
  category: 'Navigation',
  status: 'beta',
  description: 'Shows where the current page sits in the hierarchy, with links back up the trail.',
  entry: '@glyphui/ui',
  exports: [
    'Breadcrumb',
    'BreadcrumbList',
    'BreadcrumbItem',
    'BreadcrumbLink',
    'BreadcrumbPage',
    'BreadcrumbSeparator',
    'breadcrumbStyles',
  ],
  source: 'components/breadcrumb/breadcrumb.tsx',
  propsOf: 'BreadcrumbProps',
  examples: [
    {
      file: 'basic',
      title: 'From data',
      description: 'Pass items; the last one is the current page.',
    },
    {
      file: 'custom',
      title: 'Composed',
      description: 'Use the parts for custom separators or extra content.',
    },
  ],
  notes: [
    'Renders a nav landmark named "Breadcrumb" and marks the last item with aria-current="page".',
    'Links go through the linkComponent you pass to GlyphProvider, so client-side routing works.',
  ],
})
