import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Router integration',
  slug: 'router',
  category: 'Patterns',
  status: 'beta',
  description:
    'Connect Glyph to your router once: links navigate client-side and navigation items mark the current page automatically.',
  entry: '@glyphui/ui/react-router',
  exports: ['reactRouter', 'RouterLink', 'useRouterIsActive', 'matchPath', 'useRouterUrlAdapter'],
  examples: [
    {
      file: 'active-items',
      title: 'Automatic active items',
      description:
        'These items use the docs’ own router: the current page is marked without an active prop.',
    },
  ],
  notes: [
    'Pass it once: <GlyphProvider router={reactRouter}>. Sidebar, Navbar and NavigationMenu items then set aria-current="page" from the URL.',
    'Matching works like React Router’s NavLink: an item is active on its path and every path below it. Pass end on index items such as /app.',
    'An explicit active prop always wins, so you can still mark items yourself.',
    'Hash links, external URLs and mailto: render as plain anchors and are never marked active.',
    'Other routers: pass { Link, useIsActive } yourself. The getting-started guide has TanStack Router and Next.js versions.',
    'Requires react-router 7 or later as a peer dependency.',
    'useRouterUrlAdapter() connects DataTable’s useTableUrlState to React Router: useTableUrlState({ adapter: useRouterUrlAdapter() }), so the router’s location and useSearchParams always match the table.',
  ],
})
