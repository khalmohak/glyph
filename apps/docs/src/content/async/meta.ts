import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Async',
  slug: 'async',
  category: 'Patterns',
  status: 'stable',
  description:
    'One convention for loading, error, empty and ready states. Works with TanStack Query results or useAsync.',
  entry: '@glyphui/ui',
  exports: ['Async', 'useAsync', 'EmptyState', 'ErrorState', 'LoadingState', 'stateStyles'],
  source: 'patterns/async/async.tsx',
  propsOf: 'Async',
  examples: [
    { file: 'use-async', title: 'With useAsync' },
    {
      file: 'states',
      title: 'State components',
      description: 'Use them directly anywhere a screen can be empty or fail.',
    },
  ],
  notes: [
    'Any object with status, data, error and refetch works, including useQuery() results.',
    'ErrorState has role="alert"; LoadingState has role="status".',
  ],
})
