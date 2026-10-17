import { type ComponentProps, type ReactNode, useRef } from 'react'
import { IconButton } from '../../components/button'
import { Card, CardDescription, CardTitle } from '../../components/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/dropdown-menu'
import { SegmentedControl, type SegmentedOption } from '../../components/segmented-control'
import { useComponentConfig } from '../../hooks/use-component-config'
import { useControllableState } from '../../hooks/use-controllable-state'
import { chartCardStyles } from './chart.styles'
import { ChartViewContext } from './chart-parts'
import { exportChart } from './export'
import { ChartIcon, DownloadIcon, TableIcon } from './icons'

export interface ChartPeriod<P extends string> {
  options: readonly SegmentedOption<P>[]
  value?: P
  defaultValue?: P
  onValueChange?: (value: P) => void
  /** Default "Period". */
  'aria-label'?: string
}

export interface ChartCardProps<P extends string = string>
  extends Omit<ComponentProps<'div'>, 'title' | 'children'> {
  title: ReactNode
  description?: ReactNode
  /** A period selector in the header, e.g. 7d / 30d / 90d. */
  period?: ChartPeriod<P>
  /** Extra controls in the header, before the built-in buttons. */
  actions?: ReactNode
  /** Adds a button that shows the chart's data as a table. Default true. */
  tableToggle?: boolean
  view?: 'chart' | 'table'
  defaultView?: 'chart' | 'table'
  onViewChange?: (view: 'chart' | 'table') => void
  /** Adds a download menu (PNG and SVG). Default true. */
  exportable?: boolean | { fileName?: string }
  /** Called when a download fails, e.g. to show a toast. Logs to the console by default. */
  onExportError?: (error: unknown) => void
  /** One chart from `@glyphui/ui/chart`. Its own title becomes the accessible name only. */
  children: ReactNode
}

function slug(value: ReactNode): string {
  const text = typeof value === 'string' || typeof value === 'number' ? String(value) : 'chart'
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'chart'
  )
}

/**
 * A card for one chart: title, period selector, "view as table" toggle and a download menu.
 * The chart inside hides its own caption and switches to a table when asked.
 */
export function ChartCard<P extends string = string>(inProps: ChartCardProps<P>) {
  const [props, slots] = useComponentConfig('ChartCard', inProps)
  const {
    title,
    description,
    period,
    actions,
    tableToggle = true,
    view: viewProp,
    defaultView = 'chart',
    onViewChange,
    exportable = true,
    onExportError,
    className,
    children,
    ...rest
  } = props
  const s = chartCardStyles()
  const body = useRef<HTMLDivElement>(null)
  const [view, setView] = useControllableState({
    value: viewProp,
    defaultValue: defaultView,
    onChange: onViewChange,
  })
  const fileName = (typeof exportable === 'object' ? exportable.fileName : undefined) ?? slug(title)

  const download = (format: 'png' | 'svg') => {
    exportChart(body.current, { format, fileName }).catch((error: unknown) => {
      if (onExportError) onExportError(error)
      else console.error(error)
    })
  }

  return (
    <Card data-slot="chart-card" className={s.root({ class: [slots.root, className] })} {...rest}>
      <div className={s.header({ class: slots.header })}>
        <div className={s.heading({ class: slots.heading })}>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        <div className={s.controls({ class: slots.controls })}>
          {period && (
            <SegmentedControl<P>
              size="sm"
              aria-label={period['aria-label'] ?? 'Period'}
              options={period.options}
              {...(period.value !== undefined && { value: period.value })}
              {...(period.defaultValue !== undefined && { defaultValue: period.defaultValue })}
              {...(period.onValueChange && { onValueChange: period.onValueChange })}
            />
          )}
          {actions}
          {tableToggle && (
            <IconButton
              size="sm"
              variant="ghost"
              aria-label="View as table"
              aria-pressed={view === 'table'}
              icon={view === 'table' ? <ChartIcon /> : <TableIcon />}
              onClick={() => setView(view === 'table' ? 'chart' : 'table')}
            />
          )}
          {exportable && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <IconButton
                  size="sm"
                  variant="ghost"
                  aria-label="Download chart"
                  icon={<DownloadIcon />}
                  disabled={view === 'table'}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => download('png')}>Download PNG</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => download('svg')}>Download SVG</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      <div ref={body} className={s.body({ class: slots.body })}>
        <ChartViewContext.Provider value={{ view }}>{children}</ChartViewContext.Provider>
      </div>
    </Card>
  )
}
