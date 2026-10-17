import { Select, SelectItem } from '@glyphui/ui'
import { FilePreview, type ViewerLoaders } from '@glyphui/viewers'
import { useState } from 'react'
import { fixture } from '../../../lib/fixtures'

// Viewers with extra dependencies load only when a file needs them.
const loaders: ViewerLoaders = {
  pdf: () => import('@glyphui/viewers/pdf'),
  csv: () => import('@glyphui/viewers/csv'),
  spreadsheet: () => import('@glyphui/viewers/spreadsheet'),
  code: () => import('@glyphui/viewers/code'),
  markdown: () => import('@glyphui/viewers/markdown'),
}

const files = [
  'report.pdf',
  'customers.csv',
  'sales.xlsx',
  'workspace.json',
  'reminders.ts',
  'README.md',
  'aurora.jpg',
  'clip.webm',
  'chime.wav',
  'archive.zip',
]

export default function Example() {
  const [name, setName] = useState('report.pdf')
  return (
    <div className="grid w-full gap-3">
      <Select value={name} onValueChange={setName} aria-label="Sample file" className="w-56">
        {files.map((file) => (
          <SelectItem key={file} value={file}>
            {file}
          </SelectItem>
        ))}
      </Select>
      <FilePreview key={name} file={fixture(name)} name={name} loaders={loaders} height={520} />
    </div>
  )
}
