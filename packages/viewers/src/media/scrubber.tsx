import { cn } from '@glyphui/ui'
import { type KeyboardEvent, type PointerEvent, useRef } from 'react'
import { focusRing } from '../internal/frame'

export interface ScrubberProps {
  value: number
  max: number
  /** 0–max: how much is loaded, drawn behind the played range. */
  buffered?: number
  onChange: (value: number) => void
  /** Called once a drag ends. */
  onCommit?: () => void
  label: string
  /** Spoken value, e.g. "1:04 of 3:30". */
  valueText: string
  /** Arrow-key step. Default 1% of `max`. */
  step?: number
  /** Page Up/Down step. Default 10% of `max`. */
  pageStep?: number
  className?: string
  disabled?: boolean
}

/** A horizontal slider for media position and volume, with a buffered range. */
export function Scrubber({
  value,
  max,
  buffered,
  onChange,
  onCommit,
  label,
  valueText,
  step = max / 100,
  pageStep = max / 10,
  className,
  disabled,
}: ScrubberProps) {
  const track = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
  const loaded = max > 0 && buffered !== undefined ? Math.min(100, (buffered / max) * 100) : 0

  const valueAt = (clientX: number) => {
    const rect = track.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return value
    return Math.min(max, Math.max(0, ((clientX - rect.left) / rect.width) * max))
  }
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled || max <= 0) return
    dragging.current = true
    event.currentTarget.setPointerCapture?.(event.pointerId)
    onChange(valueAt(event.clientX))
  }
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (dragging.current) onChange(valueAt(event.clientX))
  }
  const onPointerUp = () => {
    if (!dragging.current) return
    dragging.current = false
    onCommit?.()
  }
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return
    const moves: Record<string, number> = {
      ArrowRight: value + step,
      ArrowUp: value + step,
      ArrowLeft: value - step,
      ArrowDown: value - step,
      PageUp: value + pageStep,
      PageDown: value - pageStep,
      Home: 0,
      End: max,
    }
    const next = moves[event.key]
    if (next === undefined) return
    event.preventDefault()
    event.stopPropagation()
    onChange(Math.min(max, Math.max(0, next)))
    onCommit?.()
  }

  return (
    <div
      ref={track}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={Math.round(max)}
      aria-valuenow={Math.round(value)}
      aria-valuetext={valueText}
      aria-disabled={disabled || undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      className={cn(
        'group/scrub relative flex h-5 cursor-pointer touch-none items-center rounded-full',
        focusRing,
        disabled && 'cursor-default opacity-50',
        className,
      )}
    >
      <div className="relative h-1 w-full overflow-hidden rounded-full bg-current/30 transition-[height] group-hover/scrub:h-1.5">
        <div className="absolute inset-y-0 left-0 bg-current/25" style={{ width: `${loaded}%` }} />
        <div className="absolute inset-y-0 left-0 bg-primary" style={{ width: `${pct}%` }} />
      </div>
      <div
        className="absolute size-3 -translate-x-1/2 rounded-full bg-primary shadow-sm ring-2 ring-background transition-transform group-hover/scrub:scale-110"
        style={{ left: `${pct}%` }}
        aria-hidden="true"
      />
    </div>
  )
}

/** Formats seconds as `m:ss` or `h:mm:ss`. */
export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const s = Math.floor(seconds % 60)
  const m = Math.floor((seconds / 60) % 60)
  const h = Math.floor(seconds / 3600)
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}

/** Spoken form of a time, e.g. "1 minute 4 seconds". */
export function speakTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0 seconds'
  const total = Math.floor(seconds)
  const m = Math.floor(total / 60)
  const s = total % 60
  const parts = []
  if (m > 0) parts.push(`${m} ${m === 1 ? 'minute' : 'minutes'}`)
  parts.push(`${s} ${s === 1 ? 'second' : 'seconds'}`)
  return parts.join(' ')
}
