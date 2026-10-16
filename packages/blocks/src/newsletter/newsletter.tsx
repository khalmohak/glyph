import { Button, Container, cn, Heading, Input, Section, Text } from '@glyphui/ui'
import { type ComponentProps, type FormEvent, type ReactNode, useId, useState } from 'react'
import type { HeadingLevel } from '../section-header'

type Status = 'idle' | 'loading' | 'success' | 'error'

export interface NewsletterProps extends Omit<ComponentProps<'section'>, 'title' | 'onSubmit'> {
  title: ReactNode
  description?: ReactNode
  /** Called with the email. Reject (throw) to show `errorMessage` or the error's message. */
  onSubscribe: (email: string) => Promise<void> | void
  placeholder?: string
  buttonLabel?: ReactNode
  /** Small print under the form, e.g. how often you send and how to unsubscribe. */
  privacyNote?: ReactNode
  successMessage?: ReactNode
  errorMessage?: ReactNode
  invalidMessage?: ReactNode
  /** `centered` (default) or `split` with text beside the form on large screens. */
  layout?: 'centered' | 'split'
  headingLevel?: HeadingLevel
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Email signup with built-in validation, loading, success and error states. */
export function Newsletter({
  title,
  description,
  onSubscribe,
  placeholder = 'you@company.com',
  buttonLabel = 'Subscribe',
  privacyNote,
  successMessage = 'You’re subscribed. Check your inbox to confirm.',
  errorMessage,
  invalidMessage = 'Enter a valid email address.',
  layout = 'centered',
  headingLevel = 2,
  className,
  ...props
}: NewsletterProps) {
  const titleId = useId()
  const inputId = useId()
  const messageId = useId()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState<ReactNode>(null)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = email.trim()
    if (!EMAIL.test(value)) {
      setStatus('error')
      setMessage(invalidMessage)
      return
    }
    setStatus('loading')
    setMessage(null)
    try {
      await onSubscribe(value)
      setStatus('success')
      setMessage(successMessage)
      setEmail('')
    } catch (error) {
      setStatus('error')
      setMessage(
        errorMessage ??
          (error instanceof Error ? error.message : 'Something went wrong. Try again.'),
      )
    }
  }

  const split = layout === 'split'
  return (
    <Section data-slot="newsletter" aria-labelledby={titleId} className={className} {...props}>
      <Container
        size={split ? 'xl' : 'sm'}
        className={cn(
          'grid gap-6',
          split ? 'items-center lg:grid-cols-2 lg:gap-16' : 'justify-items-center text-center',
        )}
      >
        <div className={cn('grid gap-3', !split && 'justify-items-center')}>
          <Heading level={headingLevel} size="h3" id={titleId}>
            {title}
          </Heading>
          {description && <Text tone="muted">{description}</Text>}
        </div>
        <div className="grid w-full gap-2">
          <form noValidate onSubmit={submit} className="flex w-full flex-col gap-2 sm:flex-row">
            <label htmlFor={inputId} className="sr-only">
              Email address
            </label>
            <Input
              id={inputId}
              type="email"
              autoComplete="email"
              placeholder={placeholder}
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                if (status === 'error') setStatus('idle')
              }}
              aria-invalid={status === 'error' || undefined}
              aria-describedby={message ? messageId : undefined}
              className="flex-1"
            />
            <Button type="submit" loading={status === 'loading'}>
              {buttonLabel}
            </Button>
          </form>
          <p
            id={messageId}
            role={status === 'error' ? 'alert' : 'status'}
            className={cn(
              'min-h-5 text-small',
              status === 'error'
                ? 'text-danger'
                : 'text-[color-mix(in_oklab,var(--color-success)_70%,var(--color-foreground))]',
              !split && 'text-center',
            )}
          >
            {message}
          </p>
          {privacyNote && (
            <p className={cn('text-caption text-faint-foreground', !split && 'text-center')}>
              {privacyNote}
            </p>
          )}
        </div>
      </Container>
    </Section>
  )
}
