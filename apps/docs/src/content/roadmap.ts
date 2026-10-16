import type { DocMeta } from '../lib/doc'

/** Components on the roadmap. Move an entry into its own content folder when it ships. */
export const roadmap: DocMeta[] = [
  {
    name: 'DatePicker',
    slug: 'date-picker',
    category: 'Forms',
    status: 'planned',
    description:
      'Pick a date or a range from a calendar popover, with typed values and locale formatting.',
  },
  {
    name: 'Calendar',
    slug: 'calendar',
    category: 'Forms',
    status: 'planned',
    description: 'Month grid for selecting dates, the base for DatePicker.',
  },
  {
    name: 'FileUpload',
    slug: 'file-upload',
    category: 'Forms',
    status: 'planned',
    description:
      'Drag-and-drop dropzone with file list, progress and validation for type and size.',
  },
  {
    name: 'InputOTP',
    slug: 'input-otp',
    category: 'Forms',
    status: 'planned',
    description: 'One-time code input with per-character boxes and paste support.',
  },
  {
    name: 'NumberInput',
    slug: 'number-input',
    category: 'Forms',
    status: 'planned',
    description: 'Numeric input with steppers, min/max, and locale-aware formatting.',
  },
  {
    name: 'TagInput',
    slug: 'tag-input',
    category: 'Forms',
    status: 'planned',
    description: 'Free-form multi-value input that turns entries into removable tags.',
  },
  {
    name: 'Toggle',
    slug: 'toggle',
    category: 'Actions',
    status: 'planned',
    description: 'Two-state button and ToggleGroup for toolbars such as text formatting.',
  },
  {
    name: 'ContextMenu',
    slug: 'context-menu',
    category: 'Overlays',
    status: 'planned',
    description: 'Right-click menu sharing DropdownMenu’s item API.',
  },
  {
    name: 'HoverCard',
    slug: 'hover-card',
    category: 'Overlays',
    status: 'planned',
    description: 'Rich preview on hover, for user and link previews.',
  },
  {
    name: 'NavigationMenu',
    slug: 'navigation-menu',
    category: 'Navigation',
    status: 'planned',
    description: 'Mega-menu for marketing sites, with panels per top-level link.',
  },
  {
    name: 'Stepper',
    slug: 'stepper',
    category: 'Navigation',
    status: 'planned',
    description: 'Multi-step progress for wizards and onboarding flows.',
  },
  {
    name: 'Timeline',
    slug: 'timeline',
    category: 'Data display',
    status: 'planned',
    description: 'Vertical list of events with timestamps, for activity feeds and changelogs.',
  },
  {
    name: 'Carousel',
    slug: 'carousel',
    category: 'Data display',
    status: 'planned',
    description: 'Swipeable, keyboard-accessible slides for media and testimonials.',
  },
  {
    name: 'Chart',
    slug: 'chart',
    category: 'Data display',
    status: 'planned',
    description: 'Line, bar and area charts colored by theme tokens, with accessible tooltips.',
  },
  {
    name: 'TreeView',
    slug: 'tree-view',
    category: 'Data display',
    status: 'planned',
    description: 'Nested, expandable list for file trees and hierarchies.',
  },
  {
    name: 'Resizable',
    slug: 'resizable',
    category: 'Layout',
    status: 'planned',
    description: 'Panels with draggable dividers for editors and split views.',
  },
  {
    name: 'Blocks',
    slug: 'blocks',
    category: 'Patterns',
    status: 'planned',
    description:
      'Ready-made page sections: Hero, Pricing, FAQ, Testimonials, Footer and more (@glyphui/blocks).',
  },
]
