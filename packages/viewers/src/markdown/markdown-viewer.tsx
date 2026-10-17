import { cn, Prose, tv, useComponentConfig } from '@glyphui/ui'
import { Children, type ComponentProps, isValidElement, type ReactNode, useMemo } from 'react'
import Markdown, { type Components, type Options } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { CodeViewer } from '../code/code-viewer'
import { type StylesEntry, ViewerStatus } from '../internal/frame'
import { readText, type ViewerSource } from '../internal/source'
import { useViewersStylesCheck } from '../internal/styles-check'
import { useResource } from '../internal/use-resource'

export const markdownViewerStyles = /* @__PURE__ */ tv({
  slots: {
    root: 'min-w-0 [&_.contains-task-list]:list-none [&_.contains-task-list]:pl-0 [&_.task-list-item_input]:mr-2 [&_.task-list-item_input]:align-middle',
    anchor:
      'ml-2 text-faint-foreground no-underline opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 hover:text-primary-text',
    // Prose styles every <pre>; CodeViewer brings its own frame, so undo them here.
    code: 'my-[1.5em] [&_pre]:m-0! [&_pre]:rounded-none! [&_pre]:border-0! [&_pre]:bg-transparent! [&_pre]:px-0! [&_pre]:py-3! [&_pre]:text-[0.8125rem]! [&_pre]:leading-6!',
  },
})

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    MarkdownViewer: StylesEntry<typeof markdownViewerStyles>
  }
}

export interface MarkdownViewerProps {
  /** Markdown text. */
  content?: string
  /** A Markdown file to load instead: a URL, a File/Blob, or bytes. */
  source?: ViewerSource
  /** Adds `#` links to headings so readers can share them. Default true. */
  headingAnchors?: boolean
  /**
   * Extra rehype plugins. Raw HTML in the Markdown is never rendered unless you add
   * `rehype-raw` here, and then you should add `rehype-sanitize` after it.
   */
  rehypePlugins?: Options['rehypePlugins']
  /** Override how elements render, as in react-markdown. */
  components?: Components
  className?: string
}

/** Slug for a heading's id: lower case, dashes, no punctuation. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

interface HastNode {
  type: string
  tagName?: string
  value?: string
  properties?: Record<string, unknown>
  children?: HastNode[]
}

const hastText = (node: HastNode): string =>
  node.type === 'text' ? (node.value ?? '') : (node.children ?? []).map(hastText).join('')

/**
 * Gives every heading a unique id, deduplicated the way GitHub does (`setup`, `setup-1`,
 * …), so repeated headings still get working anchors and the page has no duplicate ids.
 */
function rehypeHeadingIds() {
  return (tree: HastNode) => {
    const seen = new Map<string, number>()
    const visit = (node: HastNode) => {
      if (node.type === 'element' && /^h[1-6]$/.test(node.tagName ?? '')) {
        const base = slugify(hastText(node))
        if (base) {
          const count = seen.get(base) ?? 0
          seen.set(base, count + 1)
          node.properties = { ...node.properties, id: count ? `${base}-${count}` : base }
        }
      }
      for (const child of node.children ?? []) visit(child)
    }
    visit(tree)
  }
}

function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children)
  return ''
}

/**
 * Markdown rendered with your theme's typography (`Prose`): GitHub-flavored tables, task
 * lists and strikethrough, highlighted code blocks, and heading anchors. Safe by default:
 * raw HTML is shown as text. Needs `react-markdown` and `remark-gfm` (and `shiki` for code).
 */
export function MarkdownViewer(inProps: MarkdownViewerProps) {
  const [props, slots] = useComponentConfig('MarkdownViewer', inProps)
  const { content, source, headingAnchors = true, rehypePlugins, components, className } = props
  useViewersStylesCheck()
  const s = markdownViewerStyles()

  const text = useResource(
    async (signal) => content ?? (source !== undefined ? await readText(source, signal) : ''),
    [content, source],
  )

  const renderers = useMemo<Components>(() => {
    const heading =
      (Tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6') =>
      ({ children, node: _node, id, ...rest }: ComponentProps<'h1'> & { node?: unknown }) => {
        return (
          <Tag id={id} className={headingAnchors ? 'group scroll-mt-20' : undefined} {...rest}>
            {children}
            {headingAnchors && id && (
              <a
                href={`#${id}`}
                className={s.anchor({ class: slots.anchor })}
                aria-label={`Link to ${textOf(children)}`}
              >
                #
              </a>
            )}
          </Tag>
        )
      }
    return {
      h1: heading('h1'),
      h2: heading('h2'),
      h3: heading('h3'),
      h4: heading('h4'),
      h5: heading('h5'),
      h6: heading('h6'),
      pre: ({ children }) => {
        const child = Children.only(children)
        if (!isValidElement<{ className?: string; children?: ReactNode }>(child)) {
          return <pre>{children}</pre>
        }
        const lang = /language-([\w+-]+)/.exec(child.props.className ?? '')?.[1]
        return (
          <CodeViewer
            className={s.code({ class: slots.code })}
            code={textOf(child.props.children).replace(/\n$/, '')}
            {...(lang && { language: lang })}
            lineNumbers={false}
          />
        )
      },
      // Unsafe image URLs are emptied by react-markdown; an empty src would refetch the page.
      img: ({ node: _node, src, alt, ...rest }) =>
        src ? <img src={src} alt={alt ?? ''} {...rest} /> : null,
      input: ({ node: _node, ...rest }) => (
        <input {...rest} disabled aria-label={rest.checked ? 'Done' : 'Not done'} />
      ),
      ...components,
    }
  }, [components, headingAnchors, s, slots])

  if (text.status === 'loading') return <ViewerStatus status="loading" />
  if (text.status === 'error') {
    return <ViewerStatus status="error" error={text.error} onRetry={text.reload} />
  }
  return (
    <Prose data-slot="markdown-viewer" className={cn(s.root({ class: slots.root }), className)}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHeadingIds, ...(rehypePlugins ?? [])]}
        components={renderers}
      >
        {text.data}
      </Markdown>
    </Prose>
  )
}
