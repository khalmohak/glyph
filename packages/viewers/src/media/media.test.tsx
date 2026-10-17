import { act, fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithGlyph } from '../test-utils'
import { AudioPlayer } from './audio-player'
import { ImageViewer } from './image-viewer'
import { formatTime, Scrubber, speakTime } from './scrubber'
import { VideoPlayer } from './video-player'
import { Waveform } from './waveform'

beforeEach(() => {
  // jsdom has no media playback: flip `paused` and fire the events browsers would.
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function (
    this: HTMLMediaElement,
  ) {
    Object.defineProperty(this, 'paused', { value: false, configurable: true })
    this.dispatchEvent(new Event('play'))
    return Promise.resolve()
  })
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function (
    this: HTMLMediaElement,
  ) {
    Object.defineProperty(this, 'paused', { value: true, configurable: true })
    this.dispatchEvent(new Event('pause'))
  })
  URL.createObjectURL ??= () => 'blob:fake'
  URL.revokeObjectURL ??= () => {}
})
afterEach(() => vi.restoreAllMocks())

function setDuration(el: HTMLMediaElement, seconds: number) {
  Object.defineProperty(el, 'duration', { value: seconds, configurable: true })
  act(() => {
    el.dispatchEvent(new Event('durationchange'))
  })
}

describe('time helpers', () => {
  it('formats and speaks times', () => {
    expect(formatTime(0)).toBe('0:00')
    expect(formatTime(75)).toBe('1:15')
    expect(formatTime(3725)).toBe('1:02:05')
    expect(formatTime(Number.NaN)).toBe('0:00')
    expect(speakTime(61)).toBe('1 minute 1 second')
    expect(speakTime(4)).toBe('4 seconds')
  })
})

describe('Scrubber', () => {
  it('is a keyboard slider', () => {
    const onChange = vi.fn()
    render(
      <Scrubber
        label="Position"
        value={10}
        max={100}
        step={5}
        onChange={onChange}
        valueText="10 of 100"
      />,
    )
    const slider = screen.getByRole('slider', { name: 'Position' })
    expect(slider).toHaveAttribute('aria-valuetext', '10 of 100')
    fireEvent.keyDown(slider, { key: 'ArrowRight' })
    expect(onChange).toHaveBeenLastCalledWith(15)
    fireEvent.keyDown(slider, { key: 'End' })
    expect(onChange).toHaveBeenLastCalledWith(100)
    fireEvent.keyDown(slider, { key: 'Home' })
    expect(onChange).toHaveBeenLastCalledWith(0)
  })
})

function render(ui: React.ReactElement) {
  return renderWithGlyph(ui)
}

describe('VideoPlayer', () => {
  it('plays, pauses and seeks with its controls and shortcuts', async () => {
    const { container } = render(
      <VideoPlayer
        source="https://example.com/clip.webm"
        title="Tour"
        tracks={[{ src: '/clip.vtt', srcLang: 'en', label: 'English' }]}
      />,
    )
    const video = container.querySelector('video') as HTMLVideoElement
    setDuration(video, 120)
    expect(screen.getByText('0:00 / 2:00')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Play Tour' }))
    expect(screen.getByRole('button', { name: 'Pause Tour' })).toBeInTheDocument()

    const player = screen.getByRole('group', { name: 'Tour' })
    fireEvent.keyDown(player, { key: 'l' })
    expect(video.currentTime).toBe(10)
    fireEvent.keyDown(player, { key: 'k' })
    expect(screen.getByRole('button', { name: 'Play Tour' })).toBeInTheDocument()

    fireEvent.keyDown(screen.getByRole('slider', { name: 'Position' }), { key: 'End' })
    expect(video.currentTime).toBe(120)

    await userEvent.click(screen.getByRole('button', { name: 'Show captions' }))
    expect(screen.getByRole('button', { name: 'Hide captions' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Mute' }))
    expect(video.muted).toBe(true)
  })

  it('changes playback speed', async () => {
    const { container } = render(<VideoPlayer source="/clip.webm" />)
    const video = container.querySelector('video') as HTMLVideoElement
    await userEvent.click(screen.getByRole('button', { name: /Playback speed/ }))
    await userEvent.click(await screen.findByRole('menuitemradio', { name: '1.5×' }))
    expect(video.playbackRate).toBe(1.5)
  })
})

describe('Waveform', () => {
  it('draws bars, fills the played part and seeks', () => {
    const onSeek = vi.fn()
    const { container } = render(
      <Waveform peaks={[0.2, 0.8, 0.5, 1]} currentTime={10} duration={20} onSeek={onSeek} />,
    )
    expect(container.querySelectorAll('rect')).toHaveLength(4)
    expect(container.querySelectorAll('rect.fill-primary')).toHaveLength(2)
    const slider = screen.getByRole('slider', { name: 'Audio position' })
    fireEvent.keyDown(slider, { key: 'ArrowRight' })
    expect(onSeek).toHaveBeenLastCalledWith(15)
  })
})

describe('AudioPlayer', () => {
  it('shows the title and controls, with a waveform from peaks', async () => {
    render(<AudioPlayer source="/a.wav" title="Standup" description="Oct 17" peaks={[0.5, 1]} />)
    expect(screen.getByText('Standup')).toBeInTheDocument()
    expect(screen.getByRole('slider', { name: 'Position in Standup' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Play Standup' }))
    expect(screen.getByRole('button', { name: 'Pause Standup' })).toBeInTheDocument()
  })
})

describe('ImageViewer', () => {
  it('zooms, resets and rotates', async () => {
    const { container } = render(<ImageViewer source="/photo.jpg" alt="A photo" />)
    const img = container.querySelector('img') as HTMLImageElement
    Object.defineProperty(img, 'naturalWidth', { value: 400 })
    Object.defineProperty(img, 'naturalHeight', { value: 300 })
    fireEvent.load(img)
    const toolbar = screen.getByRole('toolbar', { name: 'Image tools' })
    await userEvent.click(within(toolbar).getByRole('button', { name: 'Actual size' }))
    expect(within(toolbar).getByText('100%')).toBeInTheDocument()
    await userEvent.click(within(toolbar).getByRole('button', { name: 'Zoom in' }))
    expect(within(toolbar).getByText('125%')).toBeInTheDocument()
    fireEvent.keyDown(screen.getByRole('img', { name: 'A photo' }), { key: '-' })
    expect(within(toolbar).getByText('100%')).toBeInTheDocument()
    await userEvent.click(within(toolbar).getByRole('button', { name: 'Rotate' }))
    expect(img.style.transform).toContain('rotate(90deg)')
  })

  it('shows an error when the image fails', () => {
    const { container } = render(<ImageViewer source="/missing.jpg" alt="Missing" />)
    fireEvent.error(container.querySelector('img') as HTMLImageElement)
    expect(screen.getByText('This image could not be loaded.')).toBeInTheDocument()
  })
})
