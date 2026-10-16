import { DayPicker, type DayPickerProps } from 'react-day-picker'
import { useComponentConfig } from '../../hooks/use-component-config'
import { calendarStyles } from './calendar.styles'

export type CalendarProps = DayPickerProps

function ChevronIcon({
  className,
  orientation = 'left',
}: {
  className?: string
  orientation?: 'up' | 'down' | 'left' | 'right'
}) {
  const d = {
    left: 'm15 18-6-6 6-6',
    right: 'm9 18 6-6-6-6',
    up: 'm18 15-6-6-6 6',
    down: 'm6 9 6 6 6-6',
  }[orientation]
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={d} />
    </svg>
  )
}

/**
 * A month grid for picking dates, built on react-day-picker and styled by the theme.
 * Supports `mode="single" | "multiple" | "range"`, disabled dates and several months.
 */
export function Calendar(inProps: CalendarProps) {
  const [props, slots] = useComponentConfig('Calendar', inProps)
  const { className, classNames, components, showOutsideDays = true, ...rest } = props
  const s = calendarStyles()
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={s.root({ class: [slots.root, className] })}
      classNames={{
        months: s.months({ class: slots.months }),
        month: s.month({ class: slots.month }),
        month_caption: s.monthCaption({ class: slots.monthCaption }),
        caption_label: s.captionLabel({ class: slots.captionLabel }),
        nav: s.nav({ class: slots.nav }),
        button_previous: s.navButton({ class: slots.navButton }),
        button_next: s.navButton({ class: slots.navButton }),
        chevron: s.chevron({ class: slots.chevron }),
        month_grid: s.monthGrid({ class: slots.monthGrid }),
        weekdays: s.weekdays({ class: slots.weekdays }),
        weekday: s.weekday({ class: slots.weekday }),
        weeks: s.weeks({ class: slots.weeks }),
        week: s.week({ class: slots.week }),
        day: s.day({ class: slots.day }),
        day_button: s.dayButton({ class: slots.dayButton }),
        today: s.today({ class: slots.today }),
        selected: s.selected({ class: slots.selected }),
        outside: s.outside({ class: slots.outside }),
        disabled: s.disabled({ class: slots.disabled }),
        range_start: s.rangeStart({ class: slots.rangeStart }),
        range_middle: s.rangeMiddle({ class: slots.rangeMiddle }),
        range_end: s.rangeEnd({ class: slots.rangeEnd }),
        hidden: s.hidden({ class: slots.hidden }),
        footer: s.footer({ class: slots.footer }),
        ...classNames,
      }}
      components={{
        Chevron: ({ className: chevronClass, orientation }) => (
          <ChevronIcon className={chevronClass} orientation={orientation} />
        ),
        ...components,
      }}
      {...(rest as DayPickerProps)}
    />
  )
}
