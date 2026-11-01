import { Button, cn, Tabs, TabsContent, TabsList, TabsTrigger } from '@glyphui/ui'
import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { agentTargets, setupPrompt } from '../lib/agent-setup'
import { track } from '../lib/analytics'

const STORAGE_KEY = 'glyph-agent'

function initialAgent(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && agentTargets.some((t) => t.id === saved)) return saved
  } catch {
    // Storage blocked: start on the first agent.
  }
  return agentTargets[0]?.id ?? ''
}

function CopyPrompt({ agent, text }: { agent: string; text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Button
      size="sm"
      leftIcon={copied ? <Check /> : <Copy />}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          track('setup_prompt_copied', { agent })
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        } catch {
          // Clipboard unavailable: the prompt stays selectable.
        }
      }}
    >
      {copied ? 'Copied' : 'Copy prompt'}
    </Button>
  )
}

/**
 * `<AgentPrompt />`: a setup prompt to paste into a coding agent, one tab per agent. The choice
 * is remembered, so the guide and the home page open on the same agent.
 */
export function AgentPrompt({ className }: { className?: string }) {
  const [agent, setAgent] = useState(initialAgent)
  return (
    <Tabs
      value={agent}
      onValueChange={(value) => {
        setAgent(value)
        try {
          localStorage.setItem(STORAGE_KEY, value)
        } catch {
          // Not remembered; nothing else depends on it.
        }
      }}
      className={cn(
        'min-w-0 gap-0 overflow-hidden rounded-lg border-(length:--glyph-border-width) border-border bg-subtle',
        className,
      )}
    >
      <TabsList
        aria-label="Coding agent"
        className="overflow-x-auto border-b-(length:--glyph-border-width) border-border px-3"
      >
        {agentTargets.map((target) => (
          <TabsTrigger key={target.id} value={target.id} className="text-caption">
            {target.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {agentTargets.map((target) => {
        const prompt = setupPrompt(target)
        return (
          <TabsContent key={target.id} value={target.id} className="mt-0 grid gap-3 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-small text-muted-foreground">
                Paste into {target.id === 'other' ? 'your agent' : target.label}
              </span>
              <CopyPrompt agent={target.id} text={prompt} />
            </div>
            {/* Wraps rather than scrolls: a scrolling <pre> would need its own Tab stop. */}
            <pre className="font-mono text-[0.8125rem] leading-relaxed whitespace-pre-wrap text-foreground [overflow-wrap:anywhere]">
              <code>{prompt}</code>
            </pre>
          </TabsContent>
        )
      })}
    </Tabs>
  )
}
