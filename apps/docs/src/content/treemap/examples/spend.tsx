import { Treemap } from '@glyphui/ui/chart'

const spend = [
  { vendor: 'AWS', team: 'Platform', cost: 42800 },
  { vendor: 'Datadog', team: 'Platform', cost: 9400 },
  { vendor: 'Cloudflare', team: 'Platform', cost: 3100 },
  { vendor: 'Snowflake', team: 'Data', cost: 18600 },
  { vendor: 'Fivetran', team: 'Data', cost: 5200 },
  { vendor: 'Figma', team: 'Design', cost: 2900 },
  { vendor: 'Linear', team: 'Product', cost: 1400 },
  { vendor: 'Notion', team: 'Product', cost: 1100 },
]

const usd = (v: number) => `$${(v / 1000).toFixed(1)}k`

export default function Example() {
  return (
    <Treemap
      className="w-full"
      title="Software spend by team"
      description="October, USD"
      data={spend}
      category="vendor"
      value="cost"
      group="team"
      valueFormatter={usd}
    />
  )
}
