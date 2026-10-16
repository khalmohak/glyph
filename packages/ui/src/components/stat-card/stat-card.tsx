import type { ReactNode } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { Badge, type BadgeProps } from '../badge'
import { Card, type CardProps } from '../card'
import { statCardStyles } from './stat-card.styles'

type Trend = 'up' | 'down' | 'neutral'

export interface StatCardProps extends Omit<CardProps, 'children'> {
  label: ReactNode
  value: ReactNode
  /** Change versus the previous period, e.g. "+12.4%". */
  delta?: ReactNode
  /** Direction of the change. Colors the delta: up is good unless `invertTrend` is set. */
  trend?: Trend
  /** For metrics where going down is good (churn, latency, cost). */
  invertTrend?: boolean
  icon?: ReactNode
  description?: ReactNode
  /** A sparkline or small chart under the value. Colored with the primary color by default. */
  chart?: ReactNode
}

const ArrowUp = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
)
const ArrowDown = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M7 7l10 10M17 8v9H8" />
  </svg>
)

function deltaTone(trend: Trend, invert: boolean): BadgeProps['tone'] {
  if (trend === 'neutral') return 'neutral'
  const good = (trend === 'up') !== invert
  return good ? 'success' : 'danger'
}

/** A key metric with its label, change versus the last period, and an optional chart. */
export function StatCard(inProps: StatCardProps) {
  const [props, slots] = useComponentConfig('StatCard', inProps)
  const {
    label,
    value,
    delta,
    trend = 'neutral',
    invertTrend = false,
    icon,
    description,
    chart,
    className,
    ...cardProps
  } = props
  const s = statCardStyles()

  return (
    <Card
      data-slot="stat-card"
      className={s.root({ class: [slots.root, className] })}
      {...cardProps}
    >
      <div className={s.header({ class: slots.header })}>
        <p className={s.label({ class: slots.label })}>{label}</p>
        {icon && (
          <span className={s.icon({ class: slots.icon })} aria-hidden="true">
            {icon}
          </span>
        )}
      </div>
      <div className={s.valueRow({ class: slots.valueRow })}>
        <p data-slot="stat-card-value" className={s.value({ class: slots.value })}>
          {value}
        </p>
        {delta !== undefined && (
          <Badge
            data-trend={trend}
            tone={deltaTone(trend, invertTrend)}
            className={s.delta({ class: slots.delta })}
          >
            {trend === 'up' && <ArrowUp />}
            {trend === 'down' && <ArrowDown />}
            {delta}
          </Badge>
        )}
      </div>
      {description && <p className={s.description({ class: slots.description })}>{description}</p>}
      {chart && <div className={s.chart({ class: slots.chart })}>{chart}</div>}
    </Card>
  )
}
