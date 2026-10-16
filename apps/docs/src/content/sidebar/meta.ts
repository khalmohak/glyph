import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Sidebar',
  slug: 'sidebar',
  category: 'Patterns',
  status: 'stable',
  description:
    'Bordered navigation sidebar with sections, icons, counts and an accent bar on the active item.',
  entry: '@glyphui/ui',
  exports: [
    'Sidebar',
    'SidebarHeader',
    'SidebarContent',
    'SidebarSection',
    'SidebarItem',
    'SidebarFooter',
    'SidebarTrigger',
    'sidebarStyles',
  ],
  source: 'patterns/app-shell/sidebar.tsx',
  propsOf: 'SidebarItem',
  examples: [
    { file: 'sections', title: 'Sections and footer' },
    {
      file: 'collapsed',
      title: 'Collapsed rail',
      description: 'Labels become tooltips when the sidebar is collapsed.',
    },
  ],
  notes: [
    'SidebarItem renders a link through GlyphProvider linkComponent when href is set, otherwise a button.',
    'The active item gets aria-current="page".',
  ],
})
