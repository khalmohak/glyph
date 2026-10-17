import { RadarChart } from '@glyphui/ui/chart'

const scores = [
  { measure: 'Speed', glyph: 9, legacy: 6 },
  { measure: 'Accessibility', glyph: 9, legacy: 5 },
  { measure: 'Theming', glyph: 10, legacy: 4 },
  { measure: 'Bundle size', glyph: 7, legacy: 6 },
  { measure: 'Docs', glyph: 8, legacy: 7 },
]

export default function Example() {
  return (
    <RadarChart
      className="w-full max-w-md"
      title="Library comparison"
      description="Scored out of 10"
      data={scores}
      index="measure"
      max={10}
      series={[
        { key: 'glyph', label: 'Glyph' },
        { key: 'legacy', label: 'Legacy kit' },
      ]}
    />
  )
}
