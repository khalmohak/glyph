import { type ReactNode, useEffect, useRef, useState } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import type { StylesEntry } from '../../utils/registry'
import { tv } from '../../utils/tv'
import { Button, type ButtonProps } from '../button'

export const copyButtonStyles = /* @__PURE__ */ tv({
  slots: {
    base: '',
    icon: 'size-4',
    status: 'sr-only',
  },
})

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    CopyButton: StylesEntry<typeof copyButtonStyles>
  }
}

const icon = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

const CopyIcon = ({ className }: { className?: string }) => (
  <svg aria-hidden="true" {...icon} className={className}>
    <rect width="13" height="13" x="9" y="9" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)
const CheckIcon = ({ className }: { className?: string }) => (
  <svg aria-hidden="true" {...icon} className={className}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

export interface CopyButtonProps
  extends Omit<
    ButtonProps,
    'onClick' | 'onCopy' | 'leftIcon' | 'rightIcon' | 'iconOnly' | 'asChild' | 'value'
  > {
  /** Text written to the clipboard. */
  value: string
  /** Visible label. Without it the button is icon-only, labelled "Copy". */
  children?: ReactNode
  /** Announced and shown after copying. Default "Copied". */
  copiedLabel?: string
  /** How long the copied state lasts, in ms. Default 1500. */
  timeout?: number
  onCopy?: (value: string) => void
}

/** Copies a value to the clipboard and confirms it visually and to screen readers. */
export function CopyButton(inProps: CopyButtonProps) {
  const [props, slots] = useComponentConfig('CopyButton', inProps)
  const {
    value,
    children,
    copiedLabel = 'Copied',
    timeout = 1500,
    onCopy,
    variant = 'outline',
    className,
    'aria-label': ariaLabel,
    ...rest
  } = props
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const s = copyButtonStyles()

  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      // Clipboard blocked (permissions, insecure context): leave the button as it was.
      return
    }
    setCopied(true)
    onCopy?.(value)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), timeout)
  }

  const glyph = copied ? (
    <CheckIcon className={s.icon({ class: slots.icon })} />
  ) : (
    <CopyIcon className={s.icon({ class: slots.icon })} />
  )
  const iconOnly = children === undefined

  return (
    <Button
      data-slot="copy-button"
      data-copied={copied || undefined}
      variant={variant}
      iconOnly={iconOnly}
      onClick={copy}
      className={s.base({ class: [slots.base, className] })}
      aria-label={iconOnly ? (copied ? copiedLabel : (ariaLabel ?? 'Copy')) : ariaLabel}
      {...(!iconOnly && { leftIcon: glyph })}
      {...rest}
    >
      {iconOnly ? glyph : copied ? copiedLabel : children}
      <span role="status" className={s.status({ class: slots.status })}>
        {copied ? copiedLabel : ''}
      </span>
    </Button>
  )
}
