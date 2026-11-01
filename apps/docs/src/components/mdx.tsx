import {
  Alert,
  Code,
  cn,
  Heading,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
} from '@glyphui/ui'
import type { MDXComponents } from 'mdx/types'
import {
  Children,
  type ComponentProps,
  isValidElement,
  type ReactNode,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import { getDoc } from '../lib/catalog'
import { AgentPrompt } from './agent-prompt'
import { ExampleView } from './example-view'
import { CopyButton } from './snippet'

/**
 * How guide MDX renders: every Markdown element maps to a Glyph component, so the theme
 * styles guides like the rest of the site. (Prose would style descendants too, and leak into
 * the live examples embedded in guides.)
 */

function Anchor({ id }: { id: string | undefined }) {
  if (!id) return null
  return (
    <a
      href={`#${id}`}
      aria-label="Link to this section"
      className="ml-2 align-middle text-small text-faint-foreground no-underline opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
    >
      #
    </a>
  )
}

/** A code block highlighted at build time, with its file name and a copy button. */
export function CodeBlock({
  html,
  code,
  lang,
  title,
}: {
  html: string
  code: string
  lang?: string
  title?: string
}) {
  return (
    <figure
      data-slot="guide-code"
      className="my-6 min-w-0 overflow-hidden rounded-lg border-(length:--glyph-border-width) border-border bg-subtle"
    >
      {title && (
        <figcaption className="flex items-center gap-2 border-b-(length:--glyph-border-width) border-border px-4 py-2 font-mono text-caption text-muted-foreground">
          {title}
        </figcaption>
      )}
      <div className="relative min-w-0">
        <CopyButton text={code} className="absolute top-2 right-2 z-10" />
        <ScrollX
          html={html}
          data-lang={lang}
          className="p-4 pr-12 font-mono text-[0.8125rem] leading-relaxed [&_pre]:bg-transparent"
        />
      </div>
    </figure>
  )
}

/** Whether an element's content is wider than the element, kept up to date on resize. */
function useOverflowsX<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [overflows, setOverflows] = useState(false)
  useEffect(() => {
    const element = ref.current
    if (!element || typeof ResizeObserver === 'undefined') return
    const check = () => setOverflows(element.scrollWidth > element.clientWidth + 1)
    check()
    const observer = new ResizeObserver(check)
    observer.observe(element)
    for (const child of element.children) observer.observe(child)
    return () => observer.disconnect()
  }, [])
  return [ref, overflows] as const
}

/**
 * A horizontally scrolling container. When its content overflows, it joins the tab order
 * (with a focus ring) so keyboard users can scroll it; otherwise it adds no tab stop.
 */
function ScrollX({
  html,
  children,
  className,
  ...props
}: Omit<ComponentProps<'div'>, 'dangerouslySetInnerHTML'> & { html?: string }) {
  const [ref, overflows] = useOverflowsX<HTMLDivElement>()
  return (
    <div
      ref={ref}
      tabIndex={overflows ? 0 : undefined}
      className={cn(
        'min-w-0 overflow-x-auto outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
        className,
      )}
      {...props}
      // `html` is generated at build time by shiki from files in this repo.
      {...(html !== undefined ? { dangerouslySetInnerHTML: { __html: html } } : { children })}
    />
  )
}

const managers = ['npm', 'pnpm', 'yarn', 'bun'] as const
type Manager = (typeof managers)[number]
const STORAGE_KEY = 'glyph-docs-package-manager'

// One choice for every install block on every page, remembered across visits.
const listeners = new Set<() => void>()
let chosen: Manager | null = null
function readManager(): Manager {
  if (chosen) return chosen
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (managers.includes(stored as Manager)) chosen = stored as Manager
  } catch {
    // Storage blocked: fall back to npm.
  }
  return chosen ?? 'npm'
}
function setManager(next: Manager) {
  chosen = next
  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    // Storage blocked: the choice lasts for this page view.
  }
  for (const listener of listeners) listener()
}
function usePackageManager() {
  return useSyncExternalStore(
    (onChange) => {
      listeners.add(onChange)
      return () => listeners.delete(onChange)
    },
    readManager,
    () => 'npm' as Manager,
  )
}

function installCommand(manager: Manager, packages: string, dev: boolean) {
  switch (manager) {
    case 'npm':
      return `npm install ${dev ? '-D ' : ''}${packages}`
    case 'pnpm':
      return `pnpm add ${dev ? '-D ' : ''}${packages}`
    case 'yarn':
      return `yarn add ${dev ? '-D ' : ''}${packages}`
    case 'bun':
      return `bun add ${dev ? '-d ' : ''}${packages}`
  }
}

/** `<Install packages="@glyphui/ui" />`: the command for npm, pnpm, yarn and bun. */
export function Install({ packages, dev = false }: { packages: string; dev?: boolean }) {
  const manager = usePackageManager()
  return (
    <Tabs
      value={manager}
      onValueChange={(value) => setManager(value as Manager)}
      className="my-6 min-w-0 gap-0 overflow-hidden rounded-lg border-(length:--glyph-border-width) border-border bg-subtle"
    >
      <TabsList
        aria-label="Package manager"
        className="border-b-(length:--glyph-border-width) border-border px-3"
      >
        {managers.map((m) => (
          <TabsTrigger key={m} value={m} className="font-mono text-caption">
            {m}
          </TabsTrigger>
        ))}
      </TabsList>
      {managers.map((m) => {
        const command = installCommand(m, packages, dev)
        return (
          <TabsContent
            key={m}
            value={m}
            className="mt-0 flex items-center gap-2 py-1.5 pr-1.5 pl-4"
          >
            <ScrollX className="flex-1 rounded-xs py-1.5">
              <pre className="font-mono text-[0.8125rem] text-foreground">
                <code>{command}</code>
              </pre>
            </ScrollX>
            <CopyButton text={command} />
          </TabsContent>
        )
      })}
    </Tabs>
  )
}

type CalloutTone = 'info' | 'warning' | 'danger' | 'success' | 'neutral'

/** `<Callout tone="warning" title="…">…</Callout>`: an Alert in the flow of a guide. */
export function Callout({
  tone = 'info',
  title,
  children,
}: {
  tone?: CalloutTone
  title?: string
  children?: ReactNode
}) {
  return (
    <Alert tone={tone} title={title} className="my-6 [&_p]:my-0 [&_p+p]:mt-2">
      {children}
    </Alert>
  )
}

/** `<Example id="data-table/server" />`: a live docs example with its source. */
export function Example({ id }: { id: string }) {
  const [slug = '', file = ''] = id.split('/')
  const example = getDoc(slug)?.examples?.find((e) => e.file === file)
  if (!example) throw new Error(`Guide embeds a missing example: ${id}`)
  return (
    <div className="my-8">
      <ExampleView slug={slug} example={example} />
    </div>
  )
}

const headingClass = 'group scroll-mt-24'

function isInternal(href: string | undefined) {
  return !!href && (href.startsWith('/') || href.startsWith('#'))
}

function MdxLink({ href, children, ...props }: ComponentProps<'a'>) {
  if (href?.startsWith('#')) {
    return (
      <a
        href={href}
        className="font-medium text-primary-text underline underline-offset-4"
        {...props}
      >
        {children}
      </a>
    )
  }
  return (
    <Link
      href={href ?? '#'}
      underline="always"
      {...(!isInternal(href) && { target: '_blank', rel: 'noreferrer' })}
    >
      {children}
    </Link>
  )
}

/** Inline code; `CodeBlock` handles fenced blocks. */
function InlineCode({ children }: ComponentProps<'code'>) {
  return <Code>{children}</Code>
}

function hasBlockChild(children: ReactNode) {
  return Children.toArray(children).some(
    (child) => isValidElement(child) && typeof child.type !== 'string',
  )
}

export const mdxComponents: MDXComponents = {
  CodeBlock,
  Install,
  Callout,
  Example,
  AgentPrompt: () => <AgentPrompt className="my-6" />,
  h2: ({ id, children }) => (
    <Heading level={2} size="h3" id={id} className={cn(headingClass, 'mt-12 mb-3')}>
      {children}
      <Anchor id={id} />
    </Heading>
  ),
  h3: ({ id, children }) => (
    <Heading level={3} size="h4" id={id} className={cn(headingClass, 'mt-8 mb-2')}>
      {children}
      <Anchor id={id} />
    </Heading>
  ),
  // Paragraphs that only wrap a block component (e.g. an image figure) render as divs.
  p: ({ children }) =>
    hasBlockChild(children) ? (
      <div className="my-4">{children}</div>
    ) : (
      <Text className="my-4 text-pretty leading-relaxed">{children}</Text>
    ),
  a: MdxLink,
  code: InlineCode,
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  ul: ({ children }) => (
    <ul className="my-4 grid list-disc gap-1.5 pl-6 text-body marker:text-faint-foreground">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-4 grid list-decimal gap-1.5 pl-6 text-body marker:text-faint-foreground">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1 leading-relaxed text-pretty">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-6 border-l-2 border-border-strong pl-4 text-muted-foreground [&_p]:my-0">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-10 border-border" />,
  table: ({ children }) => (
    <ScrollX className="my-6 rounded-lg border-(length:--glyph-border-width) border-border">
      <Table>{children}</Table>
    </ScrollX>
  ),
  thead: ({ children }) => <TableHeader>{children}</TableHeader>,
  tbody: ({ children }) => <TableBody>{children}</TableBody>,
  tr: ({ children }) => <TableRow>{children}</TableRow>,
  th: ({ children }) => <TableHead>{children}</TableHead>,
  td: ({ children }) => <TableCell className="align-top">{children}</TableCell>,
}
