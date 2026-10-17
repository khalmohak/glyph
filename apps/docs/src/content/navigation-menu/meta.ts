import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'NavigationMenu',
  slug: 'navigation-menu',
  category: 'Navigation',
  status: 'beta',
  description:
    'Site navigation with dropdown panels for marketing headers, including mega-menu link cards.',
  entry: '@glyphui/ui',
  exports: [
    'NavigationMenu',
    'NavigationMenuList',
    'NavigationMenuItem',
    'NavigationMenuTrigger',
    'NavigationMenuContent',
    'NavigationMenuLink',
    'NavigationMenuViewport',
    'NavigationMenuCard',
    'navigationMenuStyles',
  ],
  source: 'components/navigation-menu/navigation-menu.tsx',
  propsOf: 'NavigationMenuCard',
  radix: 'https://www.radix-ui.com/primitives/docs/components/navigation-menu',
  examples: [
    {
      file: 'mega-menu',
      title: 'Mega menu',
      description: 'Panels share one animated viewport that resizes between them.',
    },
  ],
  notes: [
    'Links render through the provider’s linkComponent, so they use your router.',
    'For app navigation use Sidebar; for a simple site header use Navbar. NavigationMenu is for headers with rich dropdown panels.',
    'Mark the current page with active on NavigationMenuLink; it sets aria-current="page".',
  ],
  a11y: {
    keyboard: [
      { keys: 'Space or Enter', action: 'On a trigger: opens its panel.' },
      { keys: 'Arrow Left or Arrow Right', action: 'Moves between top-level items.' },
      { keys: 'Arrow Down', action: 'Moves into the open panel.' },
      { keys: 'Tab', action: 'Moves through links in the panel.' },
      { keys: 'Esc', action: 'Closes the panel and returns focus to its trigger.' },
    ],
    notes: [
      'The current page\'s link gets aria-current="page" automatically when a router is connected.',
    ],
  },
})
