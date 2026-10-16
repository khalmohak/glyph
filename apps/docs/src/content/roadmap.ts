import type { DocMeta } from '../lib/doc'

/** Components on the roadmap. Move an entry into its own content folder when it ships. */
export const roadmap: DocMeta[] = [
  {
    name: 'TimePicker',
    slug: 'time-picker',
    category: 'Forms',
    status: 'planned',
    description:
      'Pick a time of day with keyboard-friendly hour and minute segments, 12 or 24 hour.',
  },
  {
    name: 'ColorPicker',
    slug: 'color-picker',
    category: 'Forms',
    status: 'planned',
    description: 'Pick a color with a saturation area, hue slider, OKLCH/hex input and swatches.',
  },
  {
    name: 'Rating',
    slug: 'rating',
    category: 'Forms',
    status: 'planned',
    description: 'Star or custom-icon rating input with half steps and a read-only display mode.',
  },
  {
    name: 'RichTextEditor',
    slug: 'rich-text-editor',
    category: 'Forms',
    status: 'planned',
    description: 'Themed editor with a formatting toolbar, built on a headless editor engine.',
  },
  {
    name: 'Menubar',
    slug: 'menubar',
    category: 'Navigation',
    status: 'planned',
    description: 'Desktop-app style menu bar (File, Edit, View) sharing DropdownMenu’s item API.',
  },
  {
    name: 'Toolbar',
    slug: 'toolbar',
    category: 'Actions',
    status: 'planned',
    description: 'Grouped buttons and toggles with roving focus, for editors and table actions.',
  },
  {
    name: 'SortableList',
    slug: 'sortable-list',
    category: 'Data display',
    status: 'planned',
    description: 'Drag-and-drop reordering with keyboard support, for lists, boards and settings.',
  },
  {
    name: 'VirtualList',
    slug: 'virtual-list',
    category: 'Data display',
    status: 'planned',
    description: 'Render thousands of rows smoothly by drawing only what is on screen.',
  },
  {
    name: 'Tour',
    slug: 'tour',
    category: 'Overlays',
    status: 'planned',
    description: 'Step-by-step product tour that highlights elements with anchored popovers.',
  },
  {
    name: 'Kanban',
    slug: 'kanban',
    category: 'Blocks',
    status: 'planned',
    description: 'Board block with columns and draggable cards, built on SortableList.',
  },
]
