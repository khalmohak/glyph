import { type ComponentProps, type ReactNode, useEffect, useRef, useState } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { CheckIcon } from '../../internal/icons'
import { IconButton } from '../button'
import { type CodeBlockVariants, codeBlockStyles, codeStyles } from './code.styles'

/** Inline code within running text. */
export function Code(inProps: ComponentProps<'code'>) {
  const [{ className, ...rest }, slots] = useComponentConfig('Code', inProps)
  return (
    <code
      data-slot="code"
      className={codeStyles().base({ class: [slots.base, className] })}
      {...rest}
    />
  )
}

const CopyIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect width="14" height="14" x="8" y="8" rx="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
)

export interface CodeBlockProps
  extends Omit<ComponentProps<'figure'>, 'children' | 'title'>,
    CodeBlockVariants {
  /** The code to show and copy. */
  code: string
  /** File name or caption shown in the header. */
  title?: ReactNode
  /** Shown in the header when there is no title, e.g. "tsx". */
  language?: string
  /** Show a copy button. Default true. */
  copyable?: boolean
}

/** A block of code with an optional file name and a copy button. No syntax highlighting is applied. */
export function CodeBlock(inProps: CodeBlockProps) {
  const [props, slots] = useComponentConfig('CodeBlock', inProps)
  const { code, title, language, copyable = true, wrap, className, ...rest } = props
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const s = codeBlockStyles({ wrap })
  const heading = title ?? language

  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard blocked (permissions, insecure context): the code stays selectable.
    }
  }

  const copyButton = copyable ? (
    <IconButton
      size="sm"
      icon={copied ? <CheckIcon /> : <CopyIcon />}
      aria-label={copied ? 'Copied' : 'Copy code'}
      onClick={copy}
      className={
        heading ? s.copy({ class: slots.copy }) : s.floatingCopy({ class: slots.floatingCopy })
      }
    />
  ) : null

  return (
    <figure data-slot="code-block" className={s.root({ class: [slots.root, className] })} {...rest}>
      {heading ? (
        <figcaption className={s.header({ class: slots.header })}>
          <span className={s.title({ class: slots.title })}>{heading}</span>
          {copyButton}
        </figcaption>
      ) : (
        copyButton
      )}
      <pre className={s.pre({ class: slots.pre })}>
        <code>{code}</code>
      </pre>
    </figure>
  )
}
