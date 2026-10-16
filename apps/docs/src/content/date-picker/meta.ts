import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'DatePicker',
  slug: 'date-picker',
  category: 'Forms',
  status: 'beta',
  description:
    'A date field that opens a calendar, plus DateRangePicker with presets like “Last 7 days”.',
  entry: '@glyphui/ui',
  exports: ['DatePicker', 'DateRangePicker', 'datePickerStyles'],
  source: 'components/date-picker/date-picker.tsx',
  propsOf: 'DatePicker',
  examples: [
    {
      file: 'basic',
      title: 'Date',
      description: 'In a Field, with a minimum date and a clear button.',
    },
    { file: 'range', title: 'Date range with presets' },
    {
      file: 'form',
      title: 'In a form',
      description: 'Value and onValueChange map straight to FormField.',
    },
  ],
  notes: [
    'Values are Date objects (or { from, to } for ranges), never strings. Pass name to submit ISO dates with a native form.',
    'Format the trigger with any date-fns pattern through the format prop.',
  ],
})
