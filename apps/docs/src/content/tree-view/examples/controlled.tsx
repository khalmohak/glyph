import { Button, Text, type TreeNode, TreeView } from '@glyphui/ui'
import { useState } from 'react'

const nodes: TreeNode[] = [
  {
    id: 'workspace',
    label: 'Workspace',
    children: [
      { id: 'general', label: 'General' },
      { id: 'members', label: 'Members' },
      {
        id: 'billing',
        label: 'Billing',
        children: [
          { id: 'plans', label: 'Plans' },
          { id: 'invoices', label: 'Invoices' },
        ],
      },
    ],
  },
  { id: 'account', label: 'Account', children: [{ id: 'profile', label: 'Profile' }] },
]

export default function Example() {
  const [expanded, setExpanded] = useState<string[]>(['workspace'])
  const [selected, setSelected] = useState<string | null>('general')
  return (
    <div className="grid w-64 gap-3">
      <TreeView
        aria-label="Settings"
        nodes={nodes}
        expanded={expanded}
        onExpandedChange={setExpanded}
        selected={selected}
        onSelect={setSelected}
      />
      <Text size="small" tone="muted">
        Selected: <span className="font-mono text-foreground">{selected ?? 'none'}</span>
      </Text>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setExpanded(['workspace', 'billing', 'account'])}
      >
        Expand all
      </Button>
    </div>
  )
}
