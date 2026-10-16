import { type FileItem, FileUpload } from '@glyphui/ui'
import { useState } from 'react'

/** Simulates an upload: progress ticks to 100, and files over 2 MB fail. */
function fakeUpload(item: FileItem, update: (id: string, patch: Partial<FileItem>) => void) {
  let progress = 0
  const timer = setInterval(() => {
    progress += 12
    if (item.file.size > 2 * 1024 * 1024 && progress > 50) {
      clearInterval(timer)
      update(item.id, {
        progress: undefined,
        error: 'Upload failed: the server rejected files over 2 MB.',
      })
      return
    }
    update(item.id, { progress: Math.min(progress, 100) })
    if (progress >= 100) clearInterval(timer)
  }, 250)
}

export default function Example() {
  const [files, setFiles] = useState<FileItem[]>([])
  const update = (id: string, patch: Partial<FileItem>) =>
    setFiles((current) => current.map((f) => (f.id === id ? { ...f, ...patch } : f)))

  return (
    <FileUpload
      className="w-full max-w-md"
      files={files}
      onFilesChange={(next) => {
        const added = next.filter((f) => !files.some((old) => old.id === f.id))
        setFiles(next.map((f) => (added.includes(f) ? { ...f, progress: 0 } : f)))
        for (const item of added) fakeUpload(item, update)
      }}
    />
  )
}
