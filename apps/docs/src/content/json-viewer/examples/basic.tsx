import { JsonViewer } from '@glyphui/viewers/json'
import { fixture } from '../../../lib/fixtures'

export default function Example() {
  return <JsonViewer source={fixture('workspace.json')} label="workspace.json" className="w-full" />
}
