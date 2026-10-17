import type { ReactNode } from 'react'
import * as R from 'recharts'
import {
  type ChartColorValue,
  ChartFrame,
  type ChartStateProps,
  categoryColor,
  defaultFormatter,
  useChartParts,
} from './chart-parts'
import { useElementWidth } from './use-element-width'

export interface SankeyLink {
  /** Name of the node the flow starts at. */
  source: string
  /** Name of the node the flow ends at. */
  target: string
  value: number
}

export interface SankeyNode {
  name: string
  color?: ChartColorValue
}

export interface SankeyChartProps extends ChartStateProps {
  links: readonly SankeyLink[]
  /** Node order and colors. Defaults to every name in `links`, in order of appearance. */
  nodes?: readonly (SankeyNode | string)[]
  title: string
  description?: ReactNode
  hideTitle?: boolean
  valueFormatter?: (value: number) => string
  /** Plot height in pixels. Default 300. */
  height?: number
  className?: string
}

interface NodeShapeProps {
  x: number
  y: number
  width: number
  height: number
  index: number
  payload: { name: string; value: number }
}

interface LinkShapeProps {
  sourceX: number
  targetX: number
  sourceY: number
  targetY: number
  sourceControlX: number
  targetControlX: number
  linkWidth: number
  index: number
  payload: { source: { name: string }; target: { name: string }; value: number }
}

/** Where a quantity flows between stages, e.g. traffic sources to pages to signups. */
export function SankeyChart(props: SankeyChartProps) {
  const { links, valueFormatter = defaultFormatter, height = 300 } = props
  const { s, slots } = useChartParts()
  const [ref, width] = useElementWidth<HTMLDivElement>()
  const declared = (props.nodes ?? []).map((node) =>
    typeof node === 'string' ? { name: node } : node,
  )
  const names = declared.map((node) => node.name)
  for (const link of links) {
    if (!names.includes(link.source)) names.push(link.source)
    if (!names.includes(link.target)) names.push(link.target)
  }
  const colors = names.map((name, i) =>
    categoryColor(declared.find((node) => node.name === name)?.color, i),
  )
  const data = {
    nodes: names.map((name) => ({ name })),
    links: links
      .filter((link) => link.value > 0 && link.source !== link.target)
      .map((link) => ({
        source: names.indexOf(link.source),
        target: names.indexOf(link.target),
        value: link.value,
      })),
  }
  const table = {
    columns: ['Source', 'Target', 'Value'],
    rows: links.map((link) => [link.source, link.target, valueFormatter(link.value)]),
  }
  const labelRoom = Math.min(140, width * 0.25)

  // Render functions, not components: recharts calls them per shape on every render.
  const renderNode = ({ x, y, width: w, height: h, index, payload }: NodeShapeProps) => {
    const right = x + w > width - labelRoom
    return (
      <g>
        <rect x={x} y={y} width={w} height={Math.max(h, 1)} rx={2} fill={colors[index]} />
        {h > 10 && (
          <text
            x={right ? x - 8 : x + w + 8}
            y={y + h / 2}
            dominantBaseline="central"
            textAnchor={right ? 'end' : 'start'}
            fontSize={12}
            fill="var(--glyph-foreground)"
            // A halo in the surface color keeps labels readable where they cross flows.
            stroke="var(--glyph-surface)"
            strokeWidth={3}
            strokeLinejoin="round"
            paintOrder="stroke"
          >
            {payload.name}
            <tspan fill="var(--glyph-muted-foreground)" dx={6}>
              {valueFormatter(payload.value)}
            </tspan>
          </text>
        )}
      </g>
    )
  }

  const renderLink = (link: LinkShapeProps) => {
    const color = colors[names.indexOf(link.payload.source.name)]
    return (
      <path
        d={`M${link.sourceX},${link.sourceY} C${link.sourceControlX},${link.sourceY} ${link.targetControlX},${link.targetY} ${link.targetX},${link.targetY}`}
        fill="none"
        stroke={color}
        strokeWidth={Math.max(link.linkWidth, 1)}
        strokeOpacity={0.28}
        className="transition-[stroke-opacity] hover:[stroke-opacity:0.5]"
      />
    )
  }

  return (
    <ChartFrame
      title={props.title}
      description={props.description}
      hideTitle={props.hideTitle}
      className={props.className}
      table={table}
      height={height}
      isEmpty={data.links.length === 0}
      loading={props.loading}
      error={props.error}
      onRetry={props.onRetry}
      empty={props.empty}
    >
      <div ref={ref} className="w-full">
        <R.Sankey
          width={width}
          height={height}
          data={data}
          nodeWidth={10}
          nodePadding={18}
          linkCurvature={0.5}
          iterations={48}
          margin={{ top: 8, bottom: 8, left: 0, right: 0 }}
          node={renderNode}
          link={renderLink}
        >
          <R.Tooltip
            isAnimationActive={false}
            content={(p) => {
              const item = (
                p.payload as unknown as readonly { payload?: { payload?: unknown } }[] | undefined
              )?.[0]
              const payload = item?.payload?.payload as
                | {
                    source?: { name: string }
                    target?: { name: string }
                    name?: string
                    value?: number
                  }
                | undefined
              if (!p.active || !payload) return null
              const label = payload.source
                ? `${payload.source.name} → ${payload.target?.name}`
                : payload.name
              return (
                <div data-slot="chart-tooltip" className={s.tooltip({ class: slots.tooltip })}>
                  <div className={s.tooltipRow({ class: slots.tooltipRow })}>
                    <span className={s.tooltipName({ class: slots.tooltipName })}>{label}</span>
                    <span className={s.tooltipValue({ class: slots.tooltipValue })}>
                      {valueFormatter(Number(payload.value))}
                    </span>
                  </div>
                </div>
              )
            }}
          />
        </R.Sankey>
      </div>
    </ChartFrame>
  )
}
