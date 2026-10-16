import { Banner, Button } from '@glyphui/ui'

export default function Example() {
  return (
    <Banner
      tone="info"
      dismissible
      storageKey="docs-banner-webinar"
      action={
        <Button size="sm" variant="outline">
          Register
        </Button>
      }
    >
      Live walkthrough of the theme engine on Thursday at 17:00 CET.
    </Banner>
  )
}
