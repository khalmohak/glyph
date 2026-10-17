import { PieChart } from '@glyphui/ui/chart'

const sources = [
  { source: 'Organic search', visits: 48200 },
  { source: 'Direct', visits: 21900 },
  { source: 'Referral', visits: 12400 },
  { source: 'Paid', visits: 9100 },
]

export default function Example() {
  return (
    <PieChart
      title="Traffic by source"
      description="Last 30 days"
      data={sources}
      category="source"
      value="visits"
      labels="percent"
      size={220}
    />
  )
}
