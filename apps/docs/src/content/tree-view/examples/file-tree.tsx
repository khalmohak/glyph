import { type TreeNode, TreeView } from '@glyphui/ui'
import { FileCode2, FileJson, FileText, Folder } from 'lucide-react'

const nodes: TreeNode[] = [
  {
    id: 'src',
    label: 'src',
    icon: <Folder />,
    children: [
      {
        id: 'components',
        label: 'components',
        icon: <Folder />,
        children: [
          { id: 'button', label: 'button.tsx', icon: <FileCode2 /> },
          { id: 'card', label: 'card.tsx', icon: <FileCode2 /> },
        ],
      },
      { id: 'main', label: 'main.tsx', icon: <FileCode2 /> },
    ],
  },
  { id: 'package', label: 'package.json', icon: <FileJson /> },
  { id: 'readme', label: 'README.md', icon: <FileText /> },
]

export default function Example() {
  return (
    <TreeView
      aria-label="Project files"
      nodes={nodes}
      defaultExpanded={['src', 'components']}
      defaultSelected="button"
      className="w-64"
    />
  )
}
