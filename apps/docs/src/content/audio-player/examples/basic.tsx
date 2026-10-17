import { AudioPlayer } from '@glyphui/viewers/media'
import { fixture } from '../../../lib/fixtures'

export default function Example() {
  return (
    <AudioPlayer
      source={fixture('chime.wav')}
      title="Standup notes"
      description="Recorded Oct 17 · 6 seconds"
      className="w-full max-w-lg"
    />
  )
}
