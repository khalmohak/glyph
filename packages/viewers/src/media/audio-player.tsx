import { cn, tv, useComponentConfig } from '@glyphui/ui'
import { type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from 'react'
import { type StylesEntry, viewerFrameStyles } from '../internal/frame'
import { MusicIcon } from '../internal/icons'
import { sourceName, sourceUrl, type ViewerSource } from '../internal/source'
import { useViewersStylesCheck } from '../internal/styles-check'
import { MediaControls } from './media-controls'
import { handleMediaKey, useMedia } from './use-media'
import { Waveform } from './waveform'

export const audioPlayerStyles = /* @__PURE__ */ tv({
  extend: viewerFrameStyles,
  slots: {
    header: 'flex min-w-0 items-center gap-3 px-4 pt-3',
    art: 'flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground [&>svg]:size-5',
    meta: 'grid min-w-0',
    name: 'truncate text-small font-medium text-foreground',
    detail: 'truncate text-caption text-muted-foreground',
    wave: 'px-4 pt-2 text-muted-foreground',
    controls: 'px-2 pt-1 pb-2 text-foreground',
    error: 'px-4 pb-3 text-small text-danger-text',
  },
})

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    AudioPlayer: StylesEntry<typeof audioPlayerStyles>
  }
}

export interface AudioPlayerProps {
  /** The audio: a URL, a File/Blob, or bytes. */
  source: ViewerSource
  /** Title shown above the controls. Defaults to the file name. */
  title?: string
  /** A second line, e.g. the artist or a date. */
  description?: ReactNode
  /** Cover art. */
  artwork?: ReactNode
  /** Draw a waveform you can click to seek. Default true. */
  waveform?: boolean
  /** Precomputed peaks for the waveform, instead of decoding the file. */
  peaks?: readonly number[]
  loop?: boolean
  /** Draw the player as a bordered card. Default true. */
  bordered?: boolean
  className?: string
}

/**
 * An audio file with a waveform you can seek on, plus play, time, volume and speed.
 * Keyboard: Space/K play, ←/→ seek, ↑/↓ volume, M mute.
 */
export function AudioPlayer(inProps: AudioPlayerProps) {
  const [props, slots] = useComponentConfig('AudioPlayer', inProps)
  const {
    source,
    title,
    description,
    artwork,
    waveform = true,
    peaks,
    loop,
    bordered = true,
    className,
  } = props
  useViewersStylesCheck()
  const s = audioPlayerStyles({ bordered })
  const audio = useRef<HTMLAudioElement>(null)
  const media = useMedia(audio)
  const [url, setUrl] = useState<string>()
  const name = title ?? sourceName(source) ?? 'Audio'

  useEffect(() => {
    const { url, revoke } = sourceUrl(source)
    setUrl(url)
    return revoke
  }, [source])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    if (target !== event.currentTarget && target.closest('button,[role="slider"],[role="menu"]')) {
      if (event.key === ' ' || event.key.startsWith('Arrow')) return
    }
    if (handleMediaKey(event.key, media)) event.preventDefault()
  }

  return (
    // biome-ignore lint/a11y/useSemanticElements: a focusable group that takes player shortcuts
    <div
      data-slot="audio-player"
      role="group"
      aria-label={name}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      className={cn(s.root({ class: slots.root }), className)}
    >
      {/* biome-ignore lint/a11y/useMediaCaption: audio-only player */}
      <audio ref={audio} src={url} preload="metadata" loop={loop} />
      <div className={s.header({ class: slots.header })}>
        <span className={s.art({ class: slots.art })}>{artwork ?? <MusicIcon />}</span>
        <span className={s.meta({ class: slots.meta })}>
          <span className={s.name({ class: slots.name })}>{name}</span>
          {description && <span className={s.detail({ class: slots.detail })}>{description}</span>}
        </span>
      </div>
      {waveform && (
        <div className={s.wave({ class: slots.wave })}>
          <Waveform
            source={source}
            {...(peaks && { peaks })}
            currentTime={media.state.currentTime}
            duration={media.state.duration}
            onSeek={media.seek}
            height={48}
            label={`Position in ${name}`}
          />
        </div>
      )}
      <div className={s.controls({ class: slots.controls })}>
        <MediaControls media={media} label={name} {...(waveform && { scrubber: <span /> })} />
      </div>
      {media.state.error && (
        <p className={s.error({ class: slots.error })} role="alert">
          {media.state.error}
        </p>
      )}
    </div>
  )
}
