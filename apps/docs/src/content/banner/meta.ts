import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Banner',
  slug: 'banner',
  category: 'Feedback',
  status: 'beta',
  description:
    'A full-width announcement bar for the top of a page or section, optionally dismissible and remembered.',
  entry: '@glyphui/ui',
  exports: ['Banner', 'bannerStyles'],
  source: 'components/banner/banner.tsx',
  propsOf: 'BannerProps',
  examples: [
    { file: 'tones', title: 'Tones' },
    {
      file: 'dismissible',
      title: 'Dismissible',
      description: 'With storageKey, a dismissed banner stays hidden on later visits.',
    },
  ],
  notes: [
    'Rendered as a labelled region ("Announcement") so screen-reader users can find or skip it.',
  ],
})
