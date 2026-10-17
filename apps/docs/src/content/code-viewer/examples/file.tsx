import { CodeViewer } from '@glyphui/viewers/code'
import { fixture } from '../../../lib/fixtures'

export default function Example() {
  return <CodeViewer source={fixture('reminders.ts')} highlightLines="14-16" className="w-full" />
}
