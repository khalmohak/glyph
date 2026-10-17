import { AnimatePresence, m } from 'motion/react'
import type { ReactNode } from 'react'
import { IconButton } from '../../components/button'
import { XIcon } from '../../internal/icons'
import { useMotionSettings } from '../../motion/use-motion-settings'
import type { dataTableStyles } from './data-table.styles'

type Styles = ReturnType<typeof dataTableStyles>

const numberFormat = new Intl.NumberFormat()

export interface BulkBarProps {
  count: number
  allMatching: boolean
  children: ReactNode
  onClear: () => void
  s: Styles
  slots: Partial<Record<string, string>>
}

/**
 * Floats at the bottom of the table while rows are selected, with your bulk actions.
 * It sticks to the bottom of the viewport while the table scrolls past.
 */
export function BulkBar({ count, allMatching, children, onClear, s, slots }: BulkBarProps) {
  const { animate } = useMotionSettings()
  const open = count > 0
  const bar = (
    <div
      role="toolbar"
      aria-label="Bulk actions"
      data-slot="data-table-bulk-bar"
      className={s.bulkBar({ class: slots.bulkBar })}
    >
      <span className={s.bulkCount({ class: slots.bulkCount })} aria-live="polite">
        {allMatching ? `All ${numberFormat.format(count)}` : numberFormat.format(count)} selected
      </span>
      <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
      <div className="flex items-center gap-1.5">{children}</div>
      <IconButton
        variant="ghost"
        size="sm"
        icon={<XIcon />}
        aria-label="Clear selection"
        onClick={onClear}
        className="ml-1"
      />
    </div>
  )

  return (
    <div className={s.bulkDock({ class: slots.bulkDock })}>
      <div className={s.bulkPlacement({ class: slots.bulkPlacement })}>
        {animate ? (
          <AnimatePresence initial={false}>
            {open && (
              <m.div
                key="bulk"
                className="max-w-full"
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.98, transition: { duration: 0.12 } }}
              >
                {bar}
              </m.div>
            )}
          </AnimatePresence>
        ) : (
          open && bar
        )}
      </div>
    </div>
  )
}
