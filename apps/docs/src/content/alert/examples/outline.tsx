import { Alert } from '@glyphui/ui'

export default function Example() {
  return (
    <div className="grid gap-3">
      <Alert variant="outline" tone="success" title="Backup complete">
        12,481 files saved at 09:41.
      </Alert>
      <Alert variant="outline" tone="danger" title="Build failed" icon={false}>
        3 type errors in <code>src/app.tsx</code>.
      </Alert>
    </div>
  )
}
