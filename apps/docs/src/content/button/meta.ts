import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Button',
  slug: 'button',
  category: 'Actions',
  status: 'stable',
  description:
    'Triggers an action. Six variants, three sizes, icons, a loading state, and asChild for links.',
  entry: '@glyphui/ui',
  exports: ['Button', 'IconButton', 'buttonStyles'],
  source: 'components/button/button.tsx',
  propsOf: 'Button',
  examples: [
    { file: 'variants', title: 'Variants' },
    { file: 'sizes', title: 'Sizes and icons' },
    {
      file: 'loading',
      title: 'Loading',
      description: 'Disables the button, shows a spinner and sets aria-busy.',
    },
    {
      file: 'as-link',
      title: 'As a link',
      description: 'asChild renders your router link with button styles.',
    },
  ],
  notes: [
    'Defaults to type="button", so it never submits a form by accident. Use FormSubmit inside forms.',
    'IconButton requires aria-label because it has no visible text.',
  ],
  a11y: {
    keyboard: [{ keys: 'Enter or Space', action: 'Activates the button.' }],
    notes: [
      'Renders a native button, so it is focusable and announced as a button by default.',
      "While loading it sets aria-busy and is disabled, so it can't be activated twice.",
      'Icon-only buttons (IconButton) require aria-label; it is part of the props type.',
    ],
  },
})
