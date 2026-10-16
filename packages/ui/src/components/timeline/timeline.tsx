import { type ComponentProps, createContext, type ReactNode, useContext } from 'react'
import { type SlotClasses, useComponentConfig } from '../../hooks/use-component-config'
import { type TimelineVariants, timelineStyles } from './timeline.styles'

const TimelineContext = createContext<SlotClasses<'Timeline'>>({})

export interface TimelineItemData extends TimelineVariants {
  /** Stable key. Falls back to the index. */
  id?: string
  title: ReactNode
  /** Display text for when it happened, e.g. "2h ago" or "Oct 12". */
  time?: ReactNode
  /** Machine-readable date for the `<time>` element, e.g. "2026-10-12T09:41". */
  dateTime?: string
  description?: ReactNode
  /** Replaces the dot in the marker. */
  icon?: ReactNode
}

export interface TimelineProps extends Omit<ComponentProps<'ol'>, 'children'> {
  /** Data-driven items. Use `children` with TimelineItem for custom content. */
  items?: readonly TimelineItemData[]
  children?: ReactNode
}

/** A vertical list of events in order, for activity feeds, changelogs and order tracking. */
export function Timeline(inProps: TimelineProps) {
  const [props, slots] = useComponentConfig('Timeline', inProps)
  const { items, className, children, ...rest } = props
  const s = timelineStyles()
  return (
    <TimelineContext.Provider value={slots}>
      <ol data-slot="timeline" className={s.root({ class: [slots.root, className] })} {...rest}>
        {items
          ? items.map(({ id, description, ...item }, index) => (
              <TimelineItem key={id ?? index} {...item}>
                {description}
              </TimelineItem>
            ))
          : children}
      </ol>
    </TimelineContext.Provider>
  )
}

export interface TimelineItemProps
  extends Omit<ComponentProps<'li'>, 'title'>,
    Omit<TimelineItemData, 'id' | 'description'> {
  /** Description below the title. */
  children?: ReactNode
}

export function TimelineItem({
  title,
  time,
  dateTime,
  icon,
  tone,
  className,
  children,
  ...props
}: TimelineItemProps) {
  const slots = useContext(TimelineContext)
  const s = timelineStyles({ tone })
  return (
    <li
      data-slot="timeline-item"
      data-tone={tone ?? 'neutral'}
      className={s.item({ class: [slots.item, className] })}
      {...props}
    >
      <div className={s.rail({ class: slots.rail })} aria-hidden="true">
        <span className={s.marker({ class: slots.marker })}>
          {icon ?? <span className={s.dot({ class: slots.dot })} />}
        </span>
        <span className={s.connector({ class: slots.connector })} />
      </div>
      <div className={s.content({ class: slots.content })}>
        <div className={s.header({ class: slots.header })}>
          <p className={s.title({ class: slots.title })}>{title}</p>
          {time && (
            <time dateTime={dateTime} className={s.time({ class: slots.time })}>
              {time}
            </time>
          )}
        </div>
        {children && <div className={s.description({ class: slots.description })}>{children}</div>}
      </div>
    </li>
  )
}
