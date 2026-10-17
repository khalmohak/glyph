import { AuthProvider } from '@glyphui/auth'
import { memoryAdapter } from '@glyphui/auth/memory'
import { ForgotPasswordForm, ResetPasswordForm } from '@glyphui/auth/ui'
import { Button, toast } from '@glyphui/ui'
import { useState } from 'react'

export default function Example() {
  const [token, setToken] = useState<string | null>(null)
  const [adapter] = useState(() =>
    memoryAdapter({
      latency: 400,
      users: [{ email: 'ada@example.com', password: 'correct horse' }],
      onCode: ({ kind, code }) => {
        if (kind !== 'reset-password') return
        toast('Reset email sent', { description: 'Opening the link for you…' })
        setToken(code)
      },
    }),
  )
  return (
    <AuthProvider adapter={adapter} syncTabs={false}>
      <div className="grid w-full justify-items-center gap-3">
        {token ? (
          <>
            <ResetPasswordForm headingLevel={3} token={token} />
            <Button variant="ghost" size="sm" onClick={() => setToken(null)}>
              Start over
            </Button>
          </>
        ) : (
          <ForgotPasswordForm headingLevel={3} defaultEmail="ada@example.com" />
        )}
      </div>
    </AuthProvider>
  )
}
