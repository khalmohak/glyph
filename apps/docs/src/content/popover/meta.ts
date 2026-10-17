import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Popover',
  slug: 'popover',
  category: 'Overlays',
  status: 'beta',
  description:
    'Floating content anchored to a trigger, for quick settings, details or a small form.',
  entry: '@glyphui/ui',
  exports: [
    'Popover',
    'PopoverTrigger',
    'PopoverAnchor',
    'PopoverContent',
    'PopoverClose',
    'popoverStyles',
  ],
  source: 'components/popover/popover.tsx',
  propsOf: 'PopoverContentProps',
  radix: 'https://www.radix-ui.com/primitives/docs/components/popover',
  examples: [
    { file: 'share', title: 'Share link' },
    {
      file: 'arrow',
      title: 'With arrow',
      description: 'showArrow points the panel at its trigger.',
    },
  ],
  notes: [
    'Opens on click, closes on Escape or an outside click, and returns focus to the trigger.',
    'For a hint on hover, use Tooltip. For a list of actions, use DropdownMenu.',
  ],
  a11y: {
    keyboard: [
      { keys: 'Space or Enter', action: 'On the trigger: opens or closes it.' },
      { keys: 'Tab', action: 'Moves through the content.' },
      { keys: 'Esc', action: 'Closes it and returns focus to the trigger.' },
    ],
    notes: ['The trigger gets aria-expanded and aria-controls; the content is a dialog.'],
  },
})
