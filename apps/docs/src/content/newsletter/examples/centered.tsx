import { Newsletter } from '@glyphui/blocks'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default function Example() {
  return (
    <Newsletter
      title="The Ledgerline letter"
      description="One email a month on billing, pricing and getting paid faster."
      privacyNote="No spam. Unsubscribe with one click."
      onSubscribe={async (email) => {
        await wait(800)
        if (email.endsWith('@fail.dev'))
          throw new Error('We couldn’t reach the mailing service. Try again.')
      }}
    />
  )
}
