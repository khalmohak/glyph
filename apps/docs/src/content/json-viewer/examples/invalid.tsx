import { JsonViewer } from '@glyphui/viewers/json'

const broken = `{
  "name": "Ledgerline",
  "plan": "growth",
  "seats": 25,
}`

export default function Example() {
  return <JsonViewer content={broken} height={260} className="w-full" />
}
