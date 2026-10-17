import { VideoPlayer } from '@glyphui/viewers/media'
import { fixture } from '../../../lib/fixtures'

export default function Example() {
  return (
    <VideoPlayer
      source={fixture('clip.webm')}
      title="Product tour"
      tracks={[{ src: fixture('clip.vtt'), srcLang: 'en', label: 'English' }]}
      className="w-full max-w-2xl"
    />
  )
}
