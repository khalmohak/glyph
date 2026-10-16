import { AreaChart } from '@glyphui/ui/chart'

const data = [
  { week: 'W1', organic: 1200, paid: 640, referral: 310 },
  { week: 'W2', organic: 1380, paid: 720, referral: 290 },
  { week: 'W3', organic: 1510, paid: 690, referral: 380 },
  { week: 'W4', organic: 1720, paid: 810, referral: 420 },
  { week: 'W5', organic: 1890, paid: 760, referral: 470 },
]

export default function Example() {
  return (
    <AreaChart
      className="w-full"
      title="Signups by source"
      description="Weekly, last 5 weeks"
      data={data}
      index="week"
      stacked
      series={[
        { key: 'organic', label: 'Organic' },
        { key: 'paid', label: 'Paid', color: 'info' },
        { key: 'referral', label: 'Referral', color: 'success' },
      ]}
    />
  )
}
