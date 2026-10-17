import { CodeViewer } from '@glyphui/viewers/code'

export default function Example() {
  return (
    <CodeViewer
      code={
        "SELECT customer, SUM(total) AS revenue\nFROM invoices\nWHERE status = 'paid'\nGROUP BY customer\nORDER BY revenue DESC;"
      }
      language="sql"
      hideHeader
      className="w-full max-w-xl"
    />
  )
}
