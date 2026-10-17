import { Button, Card, Container, Eyebrow, Heading, Text } from '@glyphui/ui'
import { Link } from 'react-router'

const accounts = [
  { email: 'ada@example.com', password: 'correct horse', note: 'Admin, two organizations' },
  { email: 'grace@example.com', password: 'cobol rules', note: 'Member, two-step sign-in' },
]

export function HomePage() {
  return (
    <Container size="sm" className="grid gap-8 py-16">
      <div className="grid gap-3">
        <Eyebrow>@glyphui/auth</Eyebrow>
        <Heading level={1}>Authentication, end to end</Heading>
        <Text size="lead" tone="muted">
          Sign up with an emailed code, sign in with two steps, reset a password, switch
          organizations, and watch protected routes and expired sessions behave. The API is a fake
          server in your browser; emails arrive in the dev inbox.
        </Text>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link to="/app">Open the app</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/sign-up">Create an account</Link>
        </Button>
      </div>
      <Card className="gap-3">
        <Heading level={2} size="h4">
          Demo accounts
        </Heading>
        <ul className="grid gap-2 text-small">
          {accounts.map((account) => (
            <li key={account.email} className="grid gap-0.5">
              <span className="font-mono">
                {account.email} / {account.password}
              </span>
              <span className="text-muted-foreground">{account.note}</span>
            </li>
          ))}
        </ul>
      </Card>
    </Container>
  )
}
