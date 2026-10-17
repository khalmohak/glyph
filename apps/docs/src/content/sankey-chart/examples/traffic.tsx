import { SankeyChart } from '@glyphui/ui/chart'

const links = [
  { source: 'Search', target: 'Pricing', value: 4200 },
  { source: 'Search', target: 'Docs', value: 2600 },
  { source: 'Social', target: 'Pricing', value: 1300 },
  { source: 'Social', target: 'Blog', value: 2100 },
  { source: 'Referral', target: 'Pricing', value: 900 },
  { source: 'Docs', target: 'Signup', value: 700 },
  { source: 'Blog', target: 'Signup', value: 300 },
  { source: 'Pricing', target: 'Signup', value: 2400 },
]

export default function Example() {
  return (
    <SankeyChart
      className="w-full"
      title="How visitors reach signup"
      description="Sessions, last 7 days"
      links={links}
      height={300}
    />
  )
}
