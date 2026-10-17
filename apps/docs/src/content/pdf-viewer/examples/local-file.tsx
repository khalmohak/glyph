import { type FileItem, FileUpload } from '@glyphui/ui'
import { PdfViewer } from '@glyphui/viewers/pdf'
import { useState } from 'react'

export default function Example() {
  const [files, setFiles] = useState<FileItem[]>([])
  const file = files[0]?.file
  return (
    <div className="grid w-full gap-4">
      <FileUpload
        accept="application/pdf,.pdf"
        maxFiles={1}
        files={files}
        onFilesChange={setFiles}
        hint="A PDF, up to 50 MB. It stays on your device."
        maxSize={50 * 1024 * 1024}
      />
      {file && <PdfViewer source={file} height={480} />}
    </div>
  )
}
