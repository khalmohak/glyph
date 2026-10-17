import {
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@glyphui/ui'
import type { ReactNode } from 'react'
import { ToolButton } from '../internal/frame'
import { MuteIcon, PauseIcon, PlayIcon, VolumeIcon } from '../internal/icons'
import { formatTime, Scrubber, speakTime } from './scrubber'
import type { MediaApi } from './use-media'

export const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2] as const

export interface MediaControlsProps {
  media: MediaApi
  /** Label for the media, used in control names. */
  label: string
  /** Replace the position slider, e.g. with a Waveform. */
  scrubber?: ReactNode
  /** Extra buttons at the end (captions, picture in picture, fullscreen). */
  end?: ReactNode
  className?: string
  /** Hide the volume slider (still shows mute). */
  compact?: boolean
}

/** Play, position, time, volume and speed: the control bar both players share. */
export function MediaControls({
  media,
  label,
  scrubber,
  end,
  className,
  compact,
}: MediaControlsProps) {
  const { state, toggle, seek, setVolume, toggleMute, setRate } = media
  return (
    <div className={cn('flex min-w-0 items-center gap-1', className)}>
      <ToolButton
        label={state.playing ? `Pause ${label}` : `Play ${label}`}
        shortcut="K"
        icon={state.playing ? <PauseIcon /> : <PlayIcon />}
        onClick={toggle}
        className="text-current"
      />
      <span className="min-w-[5.5rem] px-1 text-caption tabular-nums">
        {formatTime(state.currentTime)} / {formatTime(state.duration)}
      </span>
      <div className="mx-1 min-w-0 flex-1">
        {scrubber ?? (
          <Scrubber
            label="Position"
            value={state.currentTime}
            max={state.duration}
            buffered={state.buffered}
            onChange={seek}
            step={5}
            pageStep={30}
            valueText={`${speakTime(state.currentTime)} of ${speakTime(state.duration)}`}
            disabled={state.duration === 0}
          />
        )}
      </div>
      <ToolButton
        label={state.muted ? 'Unmute' : 'Mute'}
        shortcut="M"
        icon={state.muted || state.volume === 0 ? <MuteIcon /> : <VolumeIcon />}
        onClick={toggleMute}
        className="text-current"
      />
      {!compact && (
        <Scrubber
          label="Volume"
          className="w-20 max-sm:hidden"
          value={state.muted ? 0 : state.volume * 100}
          max={100}
          onChange={(v) => setVolume(v / 100)}
          step={5}
          pageStep={20}
          valueText={`${Math.round((state.muted ? 0 : state.volume) * 100)}%`}
        />
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Playback speed, ${state.rate}×`}
            className="min-w-11 px-2 font-mono text-caption text-current tabular-nums"
          >
            {state.rate}×
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Speed</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={String(state.rate)}
            onValueChange={(v) => setRate(Number(v))}
          >
            {playbackRates.map((rate) => (
              <DropdownMenuRadioItem key={rate} value={String(rate)}>
                {rate === 1 ? 'Normal' : `${rate}×`}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {end}
    </div>
  )
}
