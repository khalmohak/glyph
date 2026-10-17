---
"@glyphui/ui": minor
---

Charts v2 in `@glyphui/ui/chart`.

- New chart types: `PieChart` (with slice labels; `DonutChart` is now a pie with a hole), `RadarChart`, `RadialBarChart`, `ScatterChart` (bubbles with `size`, groups with `groupBy`), `ComposedChart` (bars, lines and areas, with an optional right axis), `FunnelChart`, `Treemap`, `SankeyChart`, `Gauge` (with colored bands, read out as a meter) and `Heatmap` (a calendar of days you can move through with the arrow keys).
- Line, area, bar and composed charts get an interactive legend (click or press Enter to hide a series), `brush` to zoom, `referenceLines` and `referenceAreas`, axis options (`xAxis`, `yAxis`), `syncId`, `onPointClick`, a total row in stacked tooltips, horizontal bars (`layout="vertical"`) and 100% stacked areas (`expand`). The y axis now sizes itself to its labels.
- Every chart takes `loading`, `error` with `onRetry`, and `empty`, like the other data components.
- Charts animate in and when data changes, at the theme's motion level, and stay still for visitors who prefer reduced motion.
- `ChartCard`: a card with a period selector, a "view as table" toggle and a PNG/SVG download menu.
- `exportChart(element, { format })` downloads any chart as PNG or SVG with its title, legend and theme colors baked in.
- `Sparkline` gains `variant` (`area`, `line`, `bar`) and `showMinMax`.
- Fix: a chart color that your own code never mentioned (often `chart-4`) rendered black, because Tailwind only emits theme variables it finds in your source. Charts now use the theme's `--glyph-*` variables directly.
