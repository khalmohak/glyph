import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Alert',
  slug: 'alert',
  category: 'Feedback',
  status: 'beta',
  description:
    'An inline message about the content around it, in five tones, with optional actions and dismissal.',
  entry: '@glyphui/ui',
  exports: ['Alert', 'alertStyles'],
  source: 'components/alert/alert.tsx',
  propsOf: 'AlertProps',
  examples: [
    { file: 'tones', title: 'Tones' },
    {
      file: 'actions',
      title: 'Actions and dismiss',
      description: 'Pass onDismiss to show a close button.',
    },
    { file: 'outline', title: 'Outline' },
  ],
  notes: [
    'Danger and warning alerts use role="alert" and are announced immediately; other tones use role="status".',
    'For page-wide announcements use Banner; for messages that disappear on their own use a toast.',
  ],
})
