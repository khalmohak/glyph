import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'SocialButtons',
  slug: 'social-buttons',
  category: 'Auth',
  status: 'beta',
  description:
    '“Continue with …” buttons for the adapter’s OAuth providers, with brand marks drawn to each provider’s guidelines.',
  entry: '@glyphui/auth/ui',
  exports: ['SocialButtons', 'socialButtonsStyles'],
  source: 'ui/social-buttons.tsx',
  propsOf: 'SocialButtons',
  examples: [
    {
      file: 'stack',
      title: 'Stacked',
      description: 'The default: one full-width button per provider.',
    },
    {
      file: 'row',
      title: 'Side by side',
      description: 'layout="row" fits several providers in one line.',
    },
  ],
  notes: [
    'Google and Microsoft keep their brand colors; GitHub and Apple follow the text color, as their guidelines allow.',
    'Unknown providers get a text-only button with their capitalized name.',
    'Popup flows call onSuccess; redirect flows leave the page.',
  ],
})
