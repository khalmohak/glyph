import { SegmentedControl } from '@glyphui/ui'
import { useState } from 'react'

export default function Example() {
  const [view, setView] = useState<'list' | 'board' | 'timeline'>('board')
  return (
    <SegmentedControl
      aria-label="View"
      value={view}
      onValueChange={setView}
      options={[
        { value: 'list', label: 'List' },
        { value: 'board', label: 'Board' },
        { value: 'timeline', label: 'Timeline' },
      ]}
    />
  )
}
