import { RadialBarChart } from '@glyphui/ui/chart'

const goals = [
  { goal: 'New MRR', progress: 82 },
  { goal: 'Activation', progress: 64 },
  { goal: 'NPS responses', progress: 47 },
]

export default function Example() {
  return (
    <RadialBarChart
      title="Q4 goals"
      data={goals}
      category="goal"
      value="progress"
      max={100}
      valueFormatter={(v) => `${v}%`}
      centerLabel={
        <>
          <span className="font-display text-h4 tabular-nums">64%</span>
          <span className="text-caption text-muted-foreground">average</span>
        </>
      }
    />
  )
}
