import { SegmentedControl } from '@glyphui/ui'
import { LineChart } from '@glyphui/ui/chart'
import { useState } from 'react'

const data = [
  { month: 'Jul', mrr: 23100 },
  { month: 'Aug', mrr: 26800 },
  { month: 'Sep', mrr: 31200 },
  { month: 'Oct', mrr: 34900 },
]

type State = 'loading' | 'error' | 'empty' | 'ready'

export default function Example() {
  const [state, setState] = useState<State>('loading')
  return (
    <div className="grid w-full gap-4">
      <SegmentedControl<State>
        aria-label="State"
        size="sm"
        className="justify-self-start"
        value={state}
        onValueChange={setState}
        options={[
          { value: 'loading', label: 'Loading' },
          { value: 'error', label: 'Error' },
          { value: 'empty', label: 'Empty' },
          { value: 'ready', label: 'Ready' },
        ]}
      />
      <LineChart
        title="Monthly recurring revenue"
        data={state === 'empty' ? [] : data}
        index="month"
        series={[{ key: 'mrr', label: 'MRR' }]}
        valueFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
        height={200}
        loading={state === 'loading'}
        error={state === 'error' ? new Error('The metrics service timed out.') : undefined}
        onRetry={() => setState('ready')}
      />
    </div>
  )
}
