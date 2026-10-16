import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Newsletter',
  slug: 'newsletter',
  category: 'Blocks',
  status: 'beta',
  description: 'Email signup with validation and loading, success and error states built in.',
  entry: '@glyphui/blocks',
  exports: ['Newsletter'],
  propsOf: 'Newsletter',
  examples: [
    {
      file: 'centered',
      title: 'Centered',
      description: 'Try an address ending in @fail.dev to see the error state.',
    },
    { file: 'split', title: 'Split' },
  ],
  notes: [
    'Throw from onSubscribe to show an error; its message is used unless you pass errorMessage.',
  ],
})
