import { JsonViewer } from '@glyphui/viewers/json'

const response = {
  data: [
    { id: 'evt_1', type: 'invoice.paid', amount: 1250, livemode: true },
    { id: 'evt_2', type: 'invoice.overdue', amount: 86.5, livemode: true },
  ],
  has_more: false,
  next_cursor: null,
}

export default function Example() {
  return (
    <JsonViewer
      data={response}
      defaultExpandDepth={3}
      height={300}
      label="Events response"
      className="w-full"
    />
  )
}
