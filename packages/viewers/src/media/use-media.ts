import { type RefObject, useCallback, useEffect, useState } from 'react'

export interface MediaState {
  playing: boolean
  currentTime: number
  duration: number
  /** End of the buffered range that contains the playhead. */
  buffered: number
  volume: number
  muted: boolean
  rate: number
  waiting: boolean
  error: string | null
}

const initial: MediaState = {
  playing: false,
  currentTime: 0,
  duration: 0,
  buffered: 0,
  volume: 1,
  muted: false,
  rate: 1,
  waiting: false,
  error: null,
}

const events = [
  'play',
  'pause',
  'ended',
  'timeupdate',
  'durationchange',
  'loadedmetadata',
  'progress',
  'volumechange',
  'ratechange',
  'waiting',
  'playing',
  'canplay',
  'seeked',
  'error',
] as const

function read(el: HTMLMediaElement): MediaState {
  let buffered = 0
  for (let i = 0; i < el.buffered.length; i++) {
    if (el.buffered.start(i) <= el.currentTime && el.currentTime <= el.buffered.end(i)) {
      buffered = el.buffered.end(i)
    }
  }
  return {
    playing: !el.paused && !el.ended,
    currentTime: el.currentTime,
    duration: Number.isFinite(el.duration) ? el.duration : 0,
    buffered,
    volume: el.volume,
    muted: el.muted,
    rate: el.playbackRate,
    waiting: el.readyState < 3 && !el.paused,
    error: el.error ? 'This media file could not be played.' : null,
  }
}

/** Live state of an `<audio>` or `<video>` element, plus the actions controls need. */
export function useMedia(ref: RefObject<HTMLMediaElement | null>) {
  const [state, setState] = useState<MediaState>(initial)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const sync = () => setState(read(el))
    sync()
    for (const name of events) el.addEventListener(name, sync)
    return () => {
      for (const name of events) el.removeEventListener(name, sync)
    }
  }, [ref])

  const toggle = useCallback(() => {
    const el = ref.current
    if (!el) return
    if (el.paused || el.ended) void el.play().catch(() => {})
    else el.pause()
  }, [ref])

  const seek = useCallback(
    (time: number) => {
      const el = ref.current
      if (!el) return
      const duration = Number.isFinite(el.duration) ? el.duration : 0
      el.currentTime = Math.max(0, duration > 0 ? Math.min(duration, time) : time)
      setState(read(el))
    },
    [ref],
  )

  const setVolume = useCallback(
    (volume: number) => {
      const el = ref.current
      if (!el) return
      el.volume = Math.min(1, Math.max(0, volume))
      el.muted = el.volume === 0
    },
    [ref],
  )

  const toggleMute = useCallback(() => {
    const el = ref.current
    if (el) el.muted = !el.muted
  }, [ref])

  const setRate = useCallback(
    (rate: number) => {
      const el = ref.current
      if (el) el.playbackRate = rate
    },
    [ref],
  )

  return { state, toggle, seek, setVolume, toggleMute, setRate }
}

export type MediaApi = ReturnType<typeof useMedia>

/** Keyboard shortcuts shared by the players. Returns true when the key was handled. */
export function handleMediaKey(
  key: string,
  media: MediaApi,
  extra: Record<string, () => void> = {},
): boolean {
  const { state, toggle, seek, setVolume, toggleMute } = media
  switch (key) {
    case ' ':
    case 'k':
    case 'K':
      toggle()
      return true
    case 'ArrowRight':
      seek(state.currentTime + 5)
      return true
    case 'ArrowLeft':
      seek(state.currentTime - 5)
      return true
    case 'l':
    case 'L':
      seek(state.currentTime + 10)
      return true
    case 'j':
    case 'J':
      seek(state.currentTime - 10)
      return true
    case 'ArrowUp':
      setVolume(state.volume + 0.1)
      return true
    case 'ArrowDown':
      setVolume(state.volume - 0.1)
      return true
    case 'm':
    case 'M':
      toggleMute()
      return true
    default: {
      const action = extra[key.toLowerCase()]
      if (!action) return false
      action()
      return true
    }
  }
}
