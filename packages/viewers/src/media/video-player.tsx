import { cn, tv, useComponentConfig } from '@glyphui/ui'
import { type KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react'
import { useFullscreen } from '../internal/browser'
import { type StylesEntry, ToolButton } from '../internal/frame'
import { CaptionsIcon, MaximizeIcon, MinimizeIcon, PipIcon, PlayIcon } from '../internal/icons'
import { sourceUrl, type ViewerSource } from '../internal/source'
import { useViewersStylesCheck } from '../internal/styles-check'
import { MediaControls } from './media-controls'
import { handleMediaKey, useMedia } from './use-media'

export const videoPlayerStyles = /* @__PURE__ */ tv({
  slots: {
    root: 'group/video relative isolate overflow-hidden rounded-lg bg-black text-white outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    video: 'block size-full object-contain',
    overlay:
      'absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-(--glyph-duration-base)',
    bigPlay:
      'flex size-16 items-center justify-center rounded-full bg-black/55 text-white shadow-lg backdrop-blur-sm [&>svg]:size-7 [&>svg]:translate-x-0.5',
    bar: 'absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/45 to-transparent px-2 pt-8 pb-1.5 transition-opacity duration-(--glyph-duration-base) [&_button]:text-white [&_button:hover]:bg-white/15 [&_button:hover]:text-white',
    error:
      'absolute inset-0 flex items-center justify-center p-6 text-center text-small text-white/80',
  },
})

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    VideoPlayer: StylesEntry<typeof videoPlayerStyles>
  }
}

export interface MediaTrack {
  src: string
  /** Language code, e.g. `en`. */
  srcLang: string
  label: string
  kind?: 'subtitles' | 'captions'
  default?: boolean
}

export interface VideoPlayerProps {
  /** The video: a URL, a File/Blob, or bytes. */
  source: ViewerSource
  /** Accessible name, also used in control labels. Default "Video". */
  title?: string
  poster?: string
  /** Subtitle and caption files (WebVTT). */
  tracks?: readonly MediaTrack[]
  autoPlay?: boolean
  loop?: boolean
  /** Starts muted (needed for autoplay in most browsers). */
  muted?: boolean
  /** CSS aspect ratio of the frame. Default `16 / 9`. */
  aspectRatio?: string
  className?: string
}

/**
 * A video with themed controls: play, scrub (with the buffered range), time, volume, speed,
 * captions, picture in picture and fullscreen. Keyboard: Space/K play, ←/→ seek, ↑/↓ volume,
 * M mute, C captions, F fullscreen.
 */
export function VideoPlayer(inProps: VideoPlayerProps) {
  const [props, slots] = useComponentConfig('VideoPlayer', inProps)
  const {
    source,
    title = 'Video',
    poster,
    tracks = [],
    autoPlay,
    loop,
    muted,
    aspectRatio = '16 / 9',
    className,
  } = props
  useViewersStylesCheck()
  const s = videoPlayerStyles()
  const root = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const media = useMedia(video)
  const fullscreen = useFullscreen(useCallback(() => root.current, []))
  const [url, setUrl] = useState<string>()
  const [captions, setCaptions] = useState(() => tracks.some((t) => t.default))
  const [idle, setIdle] = useState(false)
  const pipSupported =
    typeof document !== 'undefined' &&
    'pictureInPictureEnabled' in document &&
    document.pictureInPictureEnabled

  useEffect(() => {
    const { url, revoke } = sourceUrl(source)
    setUrl(url)
    return revoke
  }, [source])

  useEffect(() => {
    const list = video.current?.textTracks
    if (!list) return
    for (let i = 0; i < list.length; i++) {
      const track = list[i]
      if (track) track.mode = captions && i === 0 ? 'showing' : 'hidden'
    }
  }, [captions])

  // Controls fade out while playing and the pointer rests.
  const wake = useRef<ReturnType<typeof setTimeout>>(undefined)
  const poke = useCallback(() => {
    setIdle(false)
    clearTimeout(wake.current)
    wake.current = setTimeout(() => setIdle(true), 2500)
  }, [])
  useEffect(() => () => clearTimeout(wake.current), [])
  const hideBar = idle && media.state.playing

  const togglePip = () => {
    const el = video.current
    if (!el) return
    if (document.pictureInPictureElement) void document.exitPictureInPicture()
    else void el.requestPictureInPicture?.()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      event.target !== event.currentTarget &&
      (event.target as HTMLElement).closest('button,[role="slider"],[role="menu"]')
    ) {
      // Buttons and sliders handle their own keys; Space on a button shouldn't also toggle.
      if (event.key === ' ' || event.key.startsWith('Arrow')) return
    }
    const handled = handleMediaKey(event.key, media, {
      f: fullscreen.toggle,
      c: () => tracks.length > 0 && setCaptions((c) => !c),
    })
    if (handled) {
      event.preventDefault()
      poke()
    }
  }

  return (
    // biome-ignore lint/a11y/useSemanticElements: a focusable group that takes player shortcuts
    <div
      ref={root}
      data-slot="video-player"
      role="group"
      aria-label={title}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: the player takes keyboard shortcuts
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerMove={poke}
      onPointerLeave={() => setIdle(true)}
      className={cn(s.root({ class: slots.root }), hideBar && 'cursor-none', className)}
      style={fullscreen.active ? undefined : { aspectRatio }}
    >
      <video
        ref={video}
        src={url}
        poster={poster}
        playsInline
        preload="metadata"
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        onClick={media.toggle}
        className={s.video({ class: slots.video })}
        crossOrigin={tracks.length > 0 ? 'anonymous' : undefined}
      >
        {tracks.map((track) => (
          <track
            key={track.src}
            src={track.src}
            srcLang={track.srcLang}
            label={track.label}
            kind={track.kind ?? 'subtitles'}
            default={track.default}
          />
        ))}
      </video>

      {media.state.error ? (
        <p className={s.error({ class: slots.error })} role="alert">
          {media.state.error}
        </p>
      ) : (
        !media.state.playing &&
        media.state.currentTime === 0 && (
          <div className={s.overlay({ class: slots.overlay })} aria-hidden="true">
            <button
              type="button"
              tabIndex={-1}
              className={s.bigPlay({ class: slots.bigPlay })}
              onClick={media.toggle}
            >
              <PlayIcon />
            </button>
          </div>
        )
      )}

      <div className={cn(s.bar({ class: slots.bar }), hideBar && 'opacity-0')}>
        <MediaControls
          media={media}
          label={title}
          end={
            <>
              {tracks.length > 0 && (
                <ToolButton
                  label={captions ? 'Hide captions' : 'Show captions'}
                  shortcut="C"
                  icon={<CaptionsIcon />}
                  aria-pressed={captions}
                  onClick={() => setCaptions((c) => !c)}
                />
              )}
              {pipSupported && (
                <ToolButton label="Picture in picture" icon={<PipIcon />} onClick={togglePip} />
              )}
              {fullscreen.supported && (
                <ToolButton
                  label={fullscreen.active ? 'Exit fullscreen' : 'Fullscreen'}
                  shortcut="F"
                  icon={fullscreen.active ? <MinimizeIcon /> : <MaximizeIcon />}
                  onClick={fullscreen.toggle}
                />
              )}
            </>
          }
        />
      </div>
    </div>
  )
}
