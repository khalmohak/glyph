import type { ComponentProps, ReactNode } from 'react'
import { useComponentConfig } from '../../hooks/use-component-config'
import { ChevronLeftIcon, ChevronRightIcon } from '../../internal/icons'
import { useLinkComponent } from '../../provider/glyph-context'
import { type PaginationVariants, paginationStyles } from './pagination.styles'
import { paginationRange } from './pagination-range'

const ChevronsLeftIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m11 17-5-5 5-5M18 17l-5-5 5-5" />
  </svg>
)
const ChevronsRightIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m6 17 5-5-5-5M13 17l5-5-5-5" />
  </svg>
)

export interface PaginationProps
  extends Omit<ComponentProps<'nav'>, 'onChange'>,
    PaginationVariants {
  /** Current page, starting at 1. */
  page: number
  pageCount: number
  onPageChange?: (page: number) => void
  /** Render pages as links (through the provider's linkComponent) instead of buttons. */
  getHref?: (page: number) => string
  /** Pages shown on each side of the current page. Default 1. */
  siblingCount?: number
  /** Show first / last page buttons. Default true. */
  showEdges?: boolean
}

/** Page navigation for long lists. Controlled: you own `page`. */
export function Pagination(inProps: PaginationProps) {
  const [props, slots] = useComponentConfig('Pagination', inProps)
  const {
    page,
    pageCount,
    onPageChange,
    getHref,
    siblingCount = 1,
    showEdges = true,
    size,
    className,
    ...rest
  } = props
  const Link = useLinkComponent()
  const s = paginationStyles({ size })
  const itemClass = s.item({ class: slots.item })
  const current = Math.min(Math.max(1, page), Math.max(1, pageCount))

  const control = (
    target: number,
    label: string,
    content: ReactNode,
    options: { current?: boolean } = {},
  ) => {
    const disabled = target < 1 || target > pageCount || (target === current && !options.current)
    const shared = {
      'aria-label': label,
      'aria-current': options.current ? ('page' as const) : undefined,
      className: itemClass,
    }
    if (getHref) {
      if (disabled) {
        return (
          <span aria-disabled="true" {...shared}>
            {content}
          </span>
        )
      }
      return (
        <Link href={getHref(target)} onClick={() => onPageChange?.(target)} {...shared}>
          {content}
        </Link>
      )
    }
    return (
      <button type="button" disabled={disabled} onClick={() => onPageChange?.(target)} {...shared}>
        {content}
      </button>
    )
  }

  return (
    <nav
      aria-label="Pagination"
      data-slot="pagination"
      className={s.root({ class: [slots.root, className] })}
      {...rest}
    >
      <ul className={s.list({ class: slots.list })}>
        {showEdges && <li>{control(1, 'First page', <ChevronsLeftIcon />)}</li>}
        <li>{control(current - 1, 'Previous page', <ChevronLeftIcon />)}</li>
        {paginationRange(current, pageCount, siblingCount).map((item, index) =>
          item === 'ellipsis' ? (
            <li
              key={`gap-${index}`}
              className={s.ellipsis({ class: slots.ellipsis })}
              aria-hidden="true"
            >
              …
            </li>
          ) : (
            <li key={item}>{control(item, `Page ${item}`, item, { current: item === current })}</li>
          ),
        )}
        <li>{control(current + 1, 'Next page', <ChevronRightIcon />)}</li>
        {showEdges && <li>{control(pageCount, 'Last page', <ChevronsRightIcon />)}</li>}
      </ul>
    </nav>
  )
}
