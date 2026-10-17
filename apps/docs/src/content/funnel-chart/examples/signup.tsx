import { FunnelChart } from '@glyphui/ui/chart'

const stages = [
  { stage: 'Visited pricing', people: 18420 },
  { stage: 'Started signup', people: 6210 },
  { stage: 'Verified email', people: 4870 },
  { stage: 'Created invoice', people: 2310 },
  { stage: 'Paid', people: 940 },
]

export default function Example() {
  return (
    <FunnelChart
      className="w-full"
      title="Signup to paid"
      description="Last 30 days"
      data={stages}
      category="stage"
      value="people"
    />
  )
}
