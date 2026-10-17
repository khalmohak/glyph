import { Button, type FileItem, FileUpload } from '@glyphui/ui'
import { FilePreviewDialog, formatBytes, type ViewerLoaders } from '@glyphui/viewers'
import { Eye } from 'lucide-react'
import { useState } from 'react'

const loaders: ViewerLoaders = {
  pdf: () => import('@glyphui/viewers/pdf'),
  csv: () => import('@glyphui/viewers/csv'),
  spreadsheet: () => import('@glyphui/viewers/spreadsheet'),
  code: () => import('@glyphui/viewers/code'),
  markdown: () => import('@glyphui/viewers/markdown'),
}

export default function Example() {
  const [files, setFiles] = useState<FileItem[]>([])
  return (
    <div className="grid w-full max-w-lg gap-4">
      <FileUpload
        files={files}
        onFilesChange={setFiles}
        maxFiles={6}
        hint="Any files. They stay on your device."
      />
      {files.length > 0 && (
        <ul className="grid gap-2">
          {files.map(({ id, file }) => (
            <li
              key={id}
              className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-small"
            >
              <span className="min-w-0 truncate">
                {file.name}{' '}
                <span className="text-muted-foreground">· {formatBytes(file.size)}</span>
              </span>
              <FilePreviewDialog
                file={file}
                loaders={loaders}
                trigger={
                  <Button size="sm" variant="outline" leftIcon={<Eye />}>
                    Preview
                  </Button>
                }
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
