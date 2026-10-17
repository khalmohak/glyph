import { type DragEvent, type ReactNode, useId, useRef, useState } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { useControllableState } from '../../hooks/use-controllable-state'
import { PresenceItem, PresenceList } from '../../motion/presence-list'
import { IconButton } from '../button'
import { useFieldControl } from '../field/field-context'
import { fileUploadStyles } from './file-upload.styles'

export interface FileItem {
  /** Stable id for keys and updates. Generated when files are added. */
  id: string
  file: File
  /** Upload progress, 0–100. Shows a bar while below 100. */
  progress?: number
  /** Shown under the file name, e.g. "Upload failed". */
  error?: string
}

export type FileRejectionReason = 'too-large' | 'wrong-type' | 'too-many'

export interface FileRejection {
  file: File
  reason: FileRejectionReason
  message: string
}

/** Formats bytes for people: 1 KB = 1024 bytes. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB', 'TB']
  let value = bytes / 1024
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit++
  }
  return `${value >= 10 ? Math.round(value) : value.toFixed(1)} ${units[unit]}`
}

/** Matches a file against an `accept` string like `"image/*,.pdf,application/zip"`. */
export function matchesAccept(file: File, accept: string | undefined): boolean {
  if (!accept) return true
  const name = file.name.toLowerCase()
  const type = file.type.toLowerCase()
  return accept
    .split(',')
    .map((rule) => rule.trim().toLowerCase())
    .filter(Boolean)
    .some((rule) => {
      if (rule.startsWith('.')) return name.endsWith(rule)
      if (rule.endsWith('/*')) return type.startsWith(rule.slice(0, -1))
      return type === rule
    })
}

let counter = 0
const newId = () => `file-${Date.now().toString(36)}-${(counter++).toString(36)}`

export interface FileUploadProps {
  files?: FileItem[]
  defaultFiles?: FileItem[]
  onFilesChange?: (files: FileItem[]) => void
  /** Called with files that were not added and why. */
  onReject?: (rejections: FileRejection[]) => void
  /** Allowed types, as for `<input type="file" accept>`. */
  accept?: string
  /** Maximum size per file, in bytes. */
  maxSize?: number
  /** Maximum number of files in the list. */
  maxFiles?: number
  /** Allow several files. Default true. */
  multiple?: boolean
  disabled?: boolean
  /** Main dropzone text. */
  label?: ReactNode
  /** Secondary dropzone text. Defaults to a summary of `accept` and `maxSize`. */
  hint?: ReactNode
  id?: string
  className?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
}

function UploadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 16V4M7 9l5-5 5 5" />
      <path d="M20 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2" />
    </svg>
  )
}

function FileIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

/**
 * Drag-and-drop or click to choose files, with type, size and count checks and a file
 * list. It does no uploading: you get `File` objects and can set `progress` and `error`
 * on each item while your own code uploads them.
 */
export function FileUpload(inProps: FileUploadProps) {
  const [props, slots] = useComponentConfig('FileUpload', useFieldControl(inProps))
  const {
    files: filesProp,
    defaultFiles = [],
    onFilesChange,
    onReject,
    accept,
    maxSize,
    maxFiles,
    multiple = true,
    disabled,
    label,
    hint,
    id,
    className,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
  } = props
  const [files, setFiles] = useControllableState<FileItem[]>({
    value: filesProp,
    defaultValue: defaultFiles,
    onChange: onFilesChange,
  })
  const [dragging, setDragging] = useState(false)
  const [rejections, setRejections] = useState<FileRejection[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const hintId = useId()
  const rejectionsId = useId()
  const s = fileUploadStyles()

  const limit = multiple ? (maxFiles ?? Number.POSITIVE_INFINITY) : 1
  const full = files.length >= limit

  const addFiles = (incoming: File[]) => {
    const accepted: FileItem[] = []
    const rejected: FileRejection[] = []
    let room = limit - (multiple ? files.length : 0)
    for (const file of incoming) {
      if (!matchesAccept(file, accept)) {
        rejected.push({
          file,
          reason: 'wrong-type',
          message: `${file.name} isn't an allowed file type.`,
        })
      } else if (maxSize !== undefined && file.size > maxSize) {
        rejected.push({
          file,
          reason: 'too-large',
          message: `${file.name} is too large (${formatBytes(file.size)}). The limit is ${formatBytes(maxSize)}.`,
        })
      } else if (room <= 0) {
        rejected.push({
          file,
          reason: 'too-many',
          message: `${file.name} wasn't added: the limit is ${limit} file${limit === 1 ? '' : 's'}.`,
        })
      } else {
        accepted.push({ id: newId(), file })
        room--
      }
    }
    if (accepted.length > 0) setFiles(multiple ? [...files, ...accepted] : accepted)
    setRejections(rejected)
    if (rejected.length > 0) onReject?.(rejected)
  }

  const onDrop = (event: DragEvent) => {
    event.preventDefault()
    setDragging(false)
    if (disabled) return
    addFiles(Array.from(event.dataTransfer.files))
  }

  const defaultHint = [
    accept
      ? `Accepted: ${accept
          .split(',')
          .map((a) => a.trim())
          .join(', ')}`
      : null,
    maxSize !== undefined ? `up to ${formatBytes(maxSize)} each` : null,
    multiple && maxFiles !== undefined ? `max ${maxFiles} files` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  const describedBy =
    [ariaDescribedBy, hintId, rejections.length > 0 ? rejectionsId : undefined]
      .filter(Boolean)
      .join(' ') || undefined

  return (
    <div data-slot="file-upload" className={s.root({ class: [slots.root, className] })}>
      <button
        type="button"
        id={id}
        data-dragging={dragging}
        disabled={disabled || full}
        aria-describedby={describedBy}
        aria-invalid={ariaInvalid}
        className={s.dropzone({ class: slots.dropzone })}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          event.preventDefault()
          if (!disabled) setDragging(true)
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false)
        }}
        onDrop={onDrop}
      >
        <span className={s.icon({ class: slots.icon })}>
          <UploadIcon />
        </span>
        <span className={s.title({ class: slots.title })}>
          {label ?? (
            <>
              Drop {multiple ? 'files' : 'a file'} here or{' '}
              <span className={s.highlight({ class: slots.highlight })}>browse</span>
            </>
          )}
        </span>
        <span id={hintId} className={s.hint({ class: slots.hint })}>
          {full ? 'File limit reached. Remove a file to add another.' : (hint ?? defaultHint)}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={(event) => {
          addFiles(Array.from(event.target.files ?? []))
          event.target.value = ''
        }}
      />

      {rejections.length > 0 && (
        <ul id={rejectionsId} role="alert" className={s.rejections({ class: slots.rejections })}>
          {rejections.map((r, index) => (
            // Two files can share a name and a reason; the list is replaced, never reordered.
            <li key={index}>{r.message}</li>
          ))}
        </ul>
      )}

      {files.length > 0 && (
        <ul className={s.list({ class: slots.list })} aria-label="Selected files">
          <PresenceList>
            {files.map((item) => (
              <PresenceItem
                key={item.id}
                data-slot="file-upload-item"
                className={s.item({ class: slots.item })}
              >
                <span className={s.fileIcon({ class: slots.fileIcon })}>
                  <FileIcon />
                </span>
                <span className={s.fileText({ class: slots.fileText })}>
                  <span className={s.fileName({ class: slots.fileName })}>{item.file.name}</span>
                  {item.error ? (
                    <span className={s.fileError({ class: slots.fileError })}>{item.error}</span>
                  ) : (
                    <span className={s.fileMeta({ class: slots.fileMeta })}>
                      {formatBytes(item.file.size)}
                      {item.progress !== undefined &&
                        item.progress < 100 &&
                        ` · ${Math.round(item.progress)}%`}
                    </span>
                  )}
                  {item.progress !== undefined && item.progress < 100 && !item.error && (
                    <span
                      role="progressbar"
                      aria-label={`Uploading ${item.file.name}`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(item.progress)}
                      className={s.progress({ class: slots.progress })}
                    >
                      <span
                        className={s.progressBar({ class: slots.progressBar })}
                        style={{ width: `${Math.max(0, Math.min(100, item.progress))}%` }}
                      />
                    </span>
                  )}
                </span>
                <IconButton
                  size="sm"
                  icon={<XIcon />}
                  aria-label={`Remove ${item.file.name}`}
                  disabled={disabled}
                  onClick={() => {
                    setFiles(files.filter((f) => f.id !== item.id))
                    setRejections([])
                  }}
                />
              </PresenceItem>
            ))}
          </PresenceList>
        </ul>
      )}
    </div>
  )
}
