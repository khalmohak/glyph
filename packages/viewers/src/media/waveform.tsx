import { cn, Skeleton, tv, useComponentConfig } from '@glyphui/ui'
import { type KeyboardEvent, type PointerEvent, useEffect, useRef, useState } from 'react'
import { focusRing, type StylesEntry } from '../internal/frame'
import { readBytes, type ViewerSource } from '../internal/source'
import { speakTime } from './scrubber'

export const waveformStyles = /* @__PURE__ */ tv({
  slots: {
    root: 'relative w-full cursor-pointer touch-none rounded-lg',
    svg: 'block size-full',
    played: 'fill-primary',
    rest: 'fill-faint-foreground',
  },
})

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    Waveform: StylesEntry<typeof waveformStyles>
  }
}

/**
 * Peak amplitudes (0–1) of an audio file, `bars` of them. Decodes with the Web Audio API.
 */
export async function computePeaks(
  source: ViewerSource,
  bars = 120,
  signal?: AbortSignal,
): Promise<number[]> {
  const bytes = await readBytes(source, signal)
  const Context =
    globalThis.OfflineAudioContext ??
    (globalThis as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext })
      .webkitOfflineAudioContext
  if (!Context) throw new Error('This browser can’t decode audio.')
  const context = new Context(1, 1, 44_100)
  const audio = await context.decodeAudioData(bytes.slice(0))
  const data = audio.getChannelData(0)
  const size = Math.max(1, Math.floor(data.length / bars))
  const peaks: number[] = []
  let max = 0
  for (let i = 0; i < bars; i++) {
    let peak = 0
    for (let j = i * size; j < Math.min(data.length, (i + 1) * size); j++) {
      const v = Math.abs(data[j] as number)
      if (v > peak) peak = v
    }
    peaks.push(peak)
    if (peak > max) max = peak
  }
  return max > 0 ? peaks.map((p) => p / max) : peaks
}

export interface WaveformProps {
  /** Audio to draw. Ignored when `peaks` is given. */
  source?: ViewerSource
  /** Precomputed peaks (0–1), e.g. from your server. */
  peaks?: readonly number[]
  /** Number of bars when computing peaks. Default 120. */
  bars?: number
  /** Playback position and length, in seconds. */
  currentTime?: number
  duration?: number
  /** Called when the user clicks, drags or uses the keyboard to seek. */
  onSeek?: (time: number) => void
  /** Height in px. Default 56. */
  height?: number
  /** Accessible name. Default "Audio position". */
  label?: string
  className?: string
}

/**
 * Audio peaks as bars, filled up to the playback position. It's also a slider: click, drag
 * or use the arrow keys to seek.
 */
export function Waveform(inProps: WaveformProps) {
  const [props, slots] = useComponentConfig('Waveform', inProps)
  const {
    source,
    peaks: peaksProp,
    bars = 120,
    currentTime = 0,
    duration = 0,
    onSeek,
    height = 56,
    label = 'Audio position',
    className,
  } = props
  const s = waveformStyles()
  const [peaks, setPeaks] = useState<readonly number[] | null>(peaksProp ?? null)
  const [failed, setFailed] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  useEffect(() => {
    if (peaksProp) {
      setPeaks(peaksProp)
      return
    }
    if (!source) return
    const controller = new AbortController()
    setPeaks(null)
    setFailed(false)
    computePeaks(source, bars, controller.signal).then(
      (p) => !controller.signal.aborted && setPeaks(p),
      () => !controller.signal.aborted && setFailed(true),
    )
    return () => controller.abort()
  }, [source, peaksProp, bars])

  const progress = duration > 0 ? Math.min(1, currentTime / duration) : 0
  const seekTo = (clientX: number) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect || rect.width === 0 || duration <= 0) return
    onSeek?.(Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)) * duration)
  }
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, number> = {
      ArrowRight: currentTime + 5,
      ArrowUp: currentTime + 5,
      ArrowLeft: currentTime - 5,
      ArrowDown: currentTime - 5,
      PageUp: currentTime + 30,
      PageDown: currentTime - 30,
      Home: 0,
      End: duration,
    }
    const next = moves[event.key]
    if (next === undefined || duration <= 0) return
    event.preventDefault()
    event.stopPropagation()
    onSeek?.(Math.min(duration, Math.max(0, next)))
  }

  if (failed) {
    return <div className={cn('h-14 rounded-lg bg-muted', className)} style={{ height }} />
  }
  if (!peaks) return <Skeleton className={cn('w-full', className)} style={{ height }} />

  const n = peaks.length
  const gap = 0.35
  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={Math.round(duration)}
      aria-valuenow={Math.round(currentTime)}
      aria-valuetext={`${speakTime(currentTime)} of ${speakTime(duration)}`}
      data-slot="waveform"
      onKeyDown={onKeyDown}
      onPointerDown={(event: PointerEvent<HTMLDivElement>) => {
        dragging.current = true
        event.currentTarget.setPointerCapture?.(event.pointerId)
        seekTo(event.clientX)
      }}
      onPointerMove={(event) => dragging.current && seekTo(event.clientX)}
      onPointerUp={() => {
        dragging.current = false
      }}
      className={cn(s.root({ class: slots.root }), focusRing, className)}
      style={{ height }}
    >
      <svg
        className={s.svg({ class: slots.svg })}
        viewBox={`0 0 ${n} 100`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {peaks.map((peak, i) => {
          const h = Math.max(4, peak * 100)
          return (
            <rect
              key={i}
              x={i + gap / 2}
              y={(100 - h) / 2}
              width={1 - gap}
              height={h}
              rx={0.3}
              className={
                (i + 0.5) / n <= progress
                  ? s.played({ class: slots.played })
                  : s.rest({ class: slots.rest })
              }
            />
          )
        })}
      </svg>
    </div>
  )
}
