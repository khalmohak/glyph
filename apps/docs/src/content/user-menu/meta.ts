import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'UserMenu',
  slug: 'user-menu',
  category: 'Auth',
  status: 'beta',
  description:
    'The signed-in user’s avatar menu, and an organization switcher for multi-workspace apps.',
  entry: '@glyphui/auth/ui',
  exports: ['UserMenu', 'OrganizationSwitcher', 'userMenuStyles'],
  source: 'ui/user-menu.tsx',
  propsOf: 'UserMenu',
  examples: [
    {
      file: 'sidebar',
      title: 'In a sidebar',
      description: 'OrganizationSwitcher at the top, UserMenu at the bottom, opening upward.',
    },
  ],
  notes: [
    'Items with href navigate through your router (GlyphProvider router).',
    'OrganizationSwitcher takes label and createLabel, so it can say Workspaces or Teams instead of Organizations.',
    'The Theme submenu sets light, dark or system mode; turn it off with colorMode={false}.',
    'compact shows only the avatar; the name stays available to screen readers.',
    'OrganizationSwitcher renders nothing unless the adapter supports organizations and the user has one.',
  ],
})
