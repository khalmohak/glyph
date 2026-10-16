import { AuthCard } from '@glyphui/blocks'
import { Link } from '@glyphui/ui'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default function Example() {
  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to your Ledgerline workspace."
      headingLevel={2}
      passwordHint={<Link href="#reset">Forgot password?</Link>}
      onSubmit={async ({ password }) => {
        await wait(700)
        if (password === 'wrong') throw new Error('That email and password don’t match.')
      }}
      footer={
        <>
          New here? <Link href="#signup">Create an account</Link>
        </>
      }
    />
  )
}
