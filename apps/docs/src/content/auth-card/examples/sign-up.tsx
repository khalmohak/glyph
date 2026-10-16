import { AuthCard } from '@glyphui/blocks'
import { Button, Link } from '@glyphui/ui'
import { Github } from 'lucide-react'

export default function Example() {
  return (
    <AuthCard
      mode="sign-up"
      title="Create your account"
      description="Free for 14 days. No credit card required."
      headingLevel={2}
      social={
        <Button variant="outline" fullWidth leftIcon={<Github />}>
          Continue with GitHub
        </Button>
      }
      dividerLabel="or with email"
      onSubmit={() => new Promise((resolve) => setTimeout(resolve, 700))}
      footer={
        <>
          Already have an account? <Link href="#signin">Sign in</Link>
        </>
      }
    />
  )
}
