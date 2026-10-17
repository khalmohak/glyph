import { Heatmap } from '@glyphui/ui/chart'

// A year of deploys: busy mid-week, quiet weekends, a holiday freeze in late December.
const end = new Date(2026, 9, 16)
const data = Array.from({ length: 364 }, (_, i) => {
  const day = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 363 + i)
  const weekday = day.getDay()
  const freeze = day.getMonth() === 11 && day.getDate() > 20
  const base = weekday === 0 || weekday === 6 ? 0.4 : 3 + ((i * 7919) % 5)
  return { day, deploys: freeze ? 0 : Math.max(0, Math.round(base + Math.sin(i / 9) * 2)) }
})

export default function Example() {
  return (
    <Heatmap
      className="w-full"
      title="Deploys per day"
      data={data}
      date="day"
      value="deploys"
      unit="deploys"
      to={end}
      locale="en-US"
    />
  )
}
