import { ImageViewer } from '@glyphui/viewers/media'
import { fixture } from '../../../lib/fixtures'

export default function Example() {
  return (
    <ImageViewer
      source={fixture('aurora.jpg')}
      alt="A blue-to-green gradient with a faint grid"
      height={400}
      className="w-full"
    />
  )
}
