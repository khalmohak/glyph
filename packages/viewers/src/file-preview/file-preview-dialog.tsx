import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  VisuallyHidden,
} from '@glyphui/ui'
import type { ReactNode } from 'react'
import { sourceName } from '../internal/source'
import { FilePreview, type FilePreviewProps } from './file-preview'

export interface FilePreviewDialogProps extends Omit<FilePreviewProps, 'height' | 'className'> {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Element that opens the preview, e.g. a file row or a thumbnail button. */
  trigger?: ReactNode
}

/** A file preview in a large dialog, e.g. when someone clicks an attachment. */
export function FilePreviewDialog({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  ...preview
}: FilePreviewDialogProps) {
  const name = preview.name ?? sourceName(preview.file) ?? 'File'
  return (
    <Dialog
      {...(open !== undefined && { open })}
      {...(defaultOpen !== undefined && { defaultOpen })}
      {...(onOpenChange && { onOpenChange })}
    >
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent size="xl" className="w-[calc(100vw-2rem)] max-w-6xl gap-0 overflow-hidden p-0">
        <VisuallyHidden>
          <DialogTitle>{name}</DialogTitle>
          <DialogDescription>Preview of {name}</DialogDescription>
        </VisuallyHidden>
        <FilePreview {...preview} bordered={false} height="min(80vh, 56rem)" />
      </DialogContent>
    </Dialog>
  )
}
