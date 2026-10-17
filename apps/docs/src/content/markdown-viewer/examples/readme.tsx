import { MarkdownViewer } from '@glyphui/viewers/markdown'
import { fixture } from '../../../lib/fixtures'

export default function Example() {
  return <MarkdownViewer source={fixture('README.md')} className="w-full max-w-2xl" />
}
