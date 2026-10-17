import { Badge, Button, Card, Link, Text } from '@glyphui/ui'
import { Inbox, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { INBOX_EVENT, type InboxMessage, readInbox, resetServer } from './server'

/** Stands in for an email client: codes and links the fake server "sends". */
export function DevInbox() {
  const [messages, setMessages] = useState<InboxMessage[]>(readInbox)
  const [open, setOpen] = useState(true)
  useEffect(() => {
    const update = () => setMessages(readInbox())
    window.addEventListener(INBOX_EVENT, update)
    window.addEventListener('storage', update)
    return () => {
      window.removeEventListener(INBOX_EVENT, update)
      window.removeEventListener('storage', update)
    }
  }, [])

  if (!open)
    return (
      <Button
        variant="outline"
        size="sm"
        leftIcon={<Inbox />}
        className="fixed right-4 bottom-4 z-40 shadow-md"
        onClick={() => setOpen(true)}
      >
        Dev inbox {messages.length > 0 && <Badge tone="primary">{messages.length}</Badge>}
      </Button>
    )

  return (
    <Card
      role="region"
      aria-label="Dev inbox"
      padding="sm"
      className="fixed right-4 bottom-4 z-40 w-80 max-w-[calc(100vw-2rem)] gap-2 shadow-lg"
    >
      <div className="flex items-center justify-between gap-2">
        <Text size="small" weight="medium" className="flex items-center gap-2">
          <Inbox className="size-4" aria-hidden="true" /> Dev inbox
        </Text>
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          aria-label="Hide inbox"
          onClick={() => setOpen(false)}
        >
          <X />
        </Button>
      </div>
      {messages.length === 0 ? (
        <Text size="small" tone="muted">
          Emails the demo server sends (codes, reset links) show up here.
        </Text>
      ) : (
        <ul className="grid max-h-64 gap-2 overflow-y-auto" aria-label="Messages">
          {messages.map((message) => (
            <li key={message.id} className="grid gap-0.5 rounded-md bg-subtle p-2 text-small">
              <span className="font-medium">{message.subject}</span>
              <span className="truncate text-caption text-muted-foreground">To {message.to}</span>
              {message.code && (
                <span className="font-mono text-h4 tracking-widest" data-testid="inbox-code">
                  {message.code}
                </span>
              )}
              {message.link && (
                <Link href={message.link.replace(import.meta.env.BASE_URL, '/')} underline="always">
                  Open link
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          resetServer()
          location.assign(import.meta.env.BASE_URL)
        }}
      >
        Reset demo data
      </Button>
    </Card>
  )
}
