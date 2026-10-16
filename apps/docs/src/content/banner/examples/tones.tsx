import { Banner } from '@glyphui/ui'

export default function Example() {
  return (
    <div className="grid gap-3">
      <Banner tone="primary">Glyph 1.0 is out. Read what changed in the release notes.</Banner>
      <Banner>You're viewing a shared workspace in read-only mode.</Banner>
      <Banner tone="warning">Scheduled maintenance Sunday 02:00–03:00 UTC.</Banner>
      <Banner tone="danger">We couldn't reach your payment provider. Retrying in 5 minutes.</Banner>
    </div>
  )
}
