import { AuthProvider } from '@glyphui/auth'
import { memoryAdapter } from '@glyphui/auth/memory'
import { AuthLayout, SignInForm } from '@glyphui/auth/ui'
import { Text } from '@glyphui/ui'

const adapter = memoryAdapter({ latency: 400, oauthProviders: [] })

export default function Example() {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-border [&_[data-slot=auth-layout]]:min-h-[34rem]">
      <AuthProvider adapter={adapter} syncTabs={false}>
        <AuthLayout
          brand="Ledgerline"
          footer="© 2026 Ledgerline, Inc."
          aside={
            <figure className="grid max-w-sm gap-3">
              <blockquote className="font-display text-h4 text-balance">
                “We closed the books two days faster the first month.”
              </blockquote>
              <Text size="small" tone="muted">
                Priya Raman, Controller at Northwind
              </Text>
            </figure>
          }
        >
          <SignInForm headingLevel={3} magicLink={false} />
        </AuthLayout>
      </AuthProvider>
    </div>
  )
}
