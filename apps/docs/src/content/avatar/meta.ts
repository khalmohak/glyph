import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Avatar',
  slug: 'avatar',
  category: 'Data display',
  status: 'stable',
  description: 'A person or team image with an initials fallback in a stable color per name.',
  entry: '@glyphui/ui',
  exports: ['Avatar', 'AvatarGroup', 'avatarStyles'],
  source: 'components/avatar/avatar.tsx',
  propsOf: 'Avatar',
  radix: 'https://www.radix-ui.com/primitives/docs/components/avatar',
  examples: [
    { file: 'sizes', title: 'Sizes' },
    {
      file: 'image',
      title: 'With an image',
      description: 'Falls back to initials while loading or if the image fails.',
    },
    { file: 'group', title: 'Group' },
  ],
  notes: ['The name is used for the image alt text and the initials, so it is required.'],
})
