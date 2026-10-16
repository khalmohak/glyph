import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'AppShell',
  slug: 'app-shell',
  category: 'Patterns',
  status: 'stable',
  description:
    'App layout with a sidebar and main area: desktop collapse to an icon rail, a mobile drawer, and a mobile top bar.',
  entry: '@glyphui/ui',
  exports: ['AppShell', 'useAppShell', 'appShellStyles'],
  source: 'patterns/app-shell/app-shell.tsx',
  propsOf: 'AppShell',
  examples: [
    {
      file: 'embedded',
      title: 'Embedded layout',
      description: 'layout="page" fills the viewport; "embedded" fills its parent.',
    },
  ],
  notes: [
    'The mobile drawer traps focus and closes when a SidebarItem is chosen.',
    'useAppShell exposes collapsed and mobileOpen state to your own components.',
  ],
})
