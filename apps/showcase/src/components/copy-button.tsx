import { Button, type ButtonProps } from '@glyphui/ui'
import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

export function CopyButton({ text, children, ...props }: ButtonProps & { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      {...props}
      rightIcon={copied ? <Check /> : <Copy />}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setCopied(true)
          setTimeout(() => setCopied(false), 1600)
        } catch {
          // Clipboard blocked: the command stays visible to select by hand.
        }
      }}
    >
      {children}
      <span className="sr-only" aria-live="polite">
        {copied ? 'Copied' : ''}
      </span>
    </Button>
  )
}
