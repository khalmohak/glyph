import { BarChart } from '@glyphui/ui/chart'

const data = [
  { page: '/pricing', views: 18420 },
  { page: '/docs/getting-started', views: 12950 },
  { page: '/blog/usage-billing', views: 8730 },
  { page: '/changelog', views: 5210 },
  { page: '/integrations/stripe', views: 3980 },
]

export default function Example() {
  return (
    <BarChart
      className="w-full"
      title="Top pages"
      description="Views, last 30 days"
      data={data}
      index="page"
      layout="vertical"
      height={230}
      xAxis={{ width: 168 }}
      series={[{ key: 'views', label: 'Views' }]}
    />
  )
}
