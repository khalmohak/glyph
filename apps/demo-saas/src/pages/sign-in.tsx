import { AuthCard } from '@glyphui/blocks'
import { Link as GlyphLink } from '@glyphui/ui'
import { useNavigate } from 'react-router'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function SignInPage() {
  const navigate = useNavigate()
  return (
    <main className="flex min-h-dvh items-center justify-center bg-subtle p-4">
      <AuthCard
        title="Welcome back"
        description="Sign in to your Ledgerline workspace."
        passwordHint={<GlyphLink href="#reset">Forgot password?</GlyphLink>}
        onSubmit={async ({ password }) => {
          await wait(600)
          if (password === 'wrong') throw new Error('That email and password don’t match.')
          navigate('/app')
        }}
        footer={
          <>
            New here? <GlyphLink href="/sign-up">Create an account</GlyphLink>
          </>
        }
      />
    </main>
  )
}
