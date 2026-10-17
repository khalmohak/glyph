import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'AuthLayout',
  slug: 'auth-layout',
  category: 'Auth',
  status: 'beta',
  description:
    'A full-page frame for auth screens: the form on one half, a brand panel on the other; the panel hides on mobile.',
  entry: '@glyphui/auth/ui',
  exports: ['AuthLayout', 'AuthNotice', 'authLayoutStyles', 'authNoticeStyles'],
  source: 'ui/auth-layout.tsx',
  propsOf: 'AuthLayout',
  examples: [
    {
      file: 'split',
      title: 'Split screen',
      description: 'Shown in a frame here; in an app it fills the page.',
    },
  ],
  notes: [
    'The panel gets a soft glow in your theme’s primary color; put a testimonial, product shot or illustration in it.',
    'AuthNotice is the confirmation card the screens use ("Check your email", "Password updated"); use it for your own steps.',
    'side="left" puts the panel first on large screens.',
  ],
})
