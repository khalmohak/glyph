import { Alert } from '@glyphui/ui'

export default function Example() {
  return (
    <div className="grid gap-3">
      <Alert title="Heads up">Workspace settings now live under your profile.</Alert>
      <Alert tone="info" title="Scheduled maintenance">
        The API will be read-only on Sunday from 02:00 to 03:00 UTC.
      </Alert>
      <Alert tone="success" title="Domain verified">
        acme.dev now serves your workspace.
      </Alert>
      <Alert tone="warning" title="Trial ends in 3 days">
        Add a payment method to keep your projects.
      </Alert>
      <Alert tone="danger" title="Payment failed">
        Your card was declined. Update it to avoid losing access.
      </Alert>
    </div>
  )
}
