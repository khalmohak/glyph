import { CsvViewer } from '@glyphui/viewers/csv'
import { useMemo } from 'react'

const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America']

/** 50,000 rows of order data, generated in the browser. */
function generate(rows: number): string {
  const lines = ['order_id,region,amount,shipped,created']
  for (let i = 0; i < rows; i++) {
    const day = String((i % 28) + 1).padStart(2, '0')
    const month = String((i % 12) + 1).padStart(2, '0')
    lines.push(
      `${100000 + i},${regions[i % 4]},${((i * 7919) % 50000) / 100},${i % 3 !== 0},2026-${month}-${day}`,
    )
  }
  return lines.join('\n')
}

export default function Example() {
  const csv = useMemo(() => generate(50_000), [])
  return <CsvViewer content={csv} fileName="orders.csv" height={420} className="w-full" />
}
