import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'HoverCard',
  slug: 'hover-card',
  category: 'Overlays',
  status: 'beta',
  description:
    'A rich preview shown while hovering or focusing a link, such as a user or repository card.',
  entry: '@glyphui/ui',
  exports: ['HoverCard', 'HoverCardTrigger', 'HoverCardContent', 'hoverCardStyles'],
  source: 'components/hover-card/hover-card.tsx',
  propsOf: 'HoverCardContent',
  radix: 'https://www.radix-ui.com/primitives/docs/components/hover-card',
  examples: [
    { file: 'user', title: 'User preview' },
    {
      file: 'delay',
      title: 'Delays',
      description: 'openDelay and closeDelay tune how eager it is.',
    },
  ],
  notes: [
    'Touch and screen-reader users may never see a hover card. Keep it a preview of information that is also available on the linked page.',
    'Use Tooltip for a short text label and Popover for interactive content opened by click.',
  ],
})
