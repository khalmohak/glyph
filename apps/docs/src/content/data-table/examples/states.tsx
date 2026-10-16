import { SegmentedControl } from '@glyphui/ui'
import { createColumnHelper, DataTable } from '@glyphui/ui/data-table'
import { useState } from 'react'

interface Deploy {
  id: string
  branch: string
}

const col = createColumnHelper<Deploy>()
const columns = [
  col.accessor('id', { header: 'Deploy' }),
  col.accessor('branch', { header: 'Branch' }),
]

export default function Example() {
  const [state, setState] = useState<'loading' | 'error' | 'empty'>('loading')
  return (
    <div className="grid gap-3">
      <SegmentedControl
        aria-label="State"
        size="sm"
        value={state}
        onValueChange={setState}
        options={[
          { value: 'loading', label: 'Loading' },
          { value: 'error', label: 'Error' },
          { value: 'empty', label: 'Empty' },
        ]}
      />
      <DataTable
        aria-label="Deploys"
        data={state === 'empty' ? [] : undefined}
        columns={columns}
        loading={state === 'loading'}
        error={state === 'error' ? new Error('Could not reach the deploy service.') : undefined}
        onRetry={() => setState('empty')}
      />
    </div>
  )
}
