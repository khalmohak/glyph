import type { StylesEntry } from '../../utils/registry'
import { focusRing, themedBorder, transition } from '../../utils/styles'
import { tv } from '../../utils/tv'

export const fileUploadStyles = /* @__PURE__ */ tv({
  slots: {
    root: 'grid gap-3',
    dropzone: [
      'flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-dashed border-border-strong bg-subtle px-6 py-8 text-center',
      themedBorder,
      transition,
      focusRing,
      'hover:border-primary/60 hover:bg-primary/4',
      'data-[dragging=true]:border-primary data-[dragging=true]:bg-primary/8',
      'disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger',
    ],
    icon: 'flex size-10 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground shadow-xs [&>svg]:size-5',
    title: 'text-small font-medium text-foreground',
    highlight: 'text-primary-text',
    hint: 'text-caption text-faint-foreground',
    rejections: 'grid gap-1 text-small font-medium text-danger-text',
    list: 'grid gap-2',
    item: [
      'grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border-border bg-surface px-3 py-2.5',
      themedBorder,
    ],
    fileIcon:
      'flex size-8 items-center justify-center rounded-sm bg-muted text-muted-foreground [&>svg]:size-4',
    fileText: 'grid min-w-0 gap-1',
    fileName: 'truncate text-small font-medium text-foreground',
    fileMeta: 'text-caption tabular-nums text-faint-foreground',
    fileError: 'text-caption font-medium text-danger-text',
    progress: 'h-1 overflow-hidden rounded-pill bg-muted',
    progressBar:
      'h-full rounded-pill bg-primary transition-[width] duration-(--glyph-duration-base)',
  },
})

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    FileUpload: StylesEntry<typeof fileUploadStyles>
  }
}
