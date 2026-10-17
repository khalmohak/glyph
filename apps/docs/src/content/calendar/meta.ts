import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'Calendar',
  slug: 'calendar',
  category: 'Forms',
  status: 'beta',
  description:
    'A month grid for picking one date, several dates or a range. The building block behind DatePicker.',
  entry: '@glyphui/ui',
  exports: ['Calendar', 'calendarStyles'],
  source: 'components/calendar/calendar.tsx',
  propsOf: 'Calendar',
  examples: [
    { file: 'single', title: 'Single date' },
    { file: 'range', title: 'Range across two months' },
    {
      file: 'disabled',
      title: 'Disabled dates',
      description: 'Pass react-day-picker matchers: weekends, before today, specific days.',
    },
  ],
  notes: [
    'Built on react-day-picker v9; every DayPicker prop works, including locale and weekStartsOn.',
    'Arrow keys move between days, Page Up/Down change month, and Enter selects.',
  ],
  a11y: {
    keyboard: [
      { keys: 'Arrow keys', action: 'Move by day or week.' },
      { keys: 'Page Up or Page Down', action: 'Previous or next month.' },
      { keys: 'Shift + Page Up or Shift + Page Down', action: 'Previous or next year.' },
      { keys: 'Home or End', action: 'Start or end of the week.' },
      { keys: 'Enter or Space', action: 'Selects the focused day.' },
    ],
    notes: ["Built on react-day-picker's accessible grid; only one day is a Tab stop."],
  },
})
