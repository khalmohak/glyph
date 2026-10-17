import { AnimatedNumber } from '@glyphui/ui'
import type { ReactNode } from 'react'

export interface BlockMotionProps {
  /**
   * Entrance animations as the block scrolls into view. They follow the theme's motion level
   * and the visitor's reduced-motion setting; `false` turns them off for this block.
   * Default true.
   */
  animate?: boolean
}

const NUMERIC = /^([^\d-]*)(-?[\d,]*\.?\d+)(.*)$/s

/**
 * Counts a stat up when it looks like a number ("4,200", "$48k", "99.9%", "4.9/5"), keeping
 * its prefix, suffix, grouping and decimals. Anything else renders as is.
 */
export function CountUp({ value, animate }: { value: ReactNode; animate: boolean }) {
  const text = typeof value === 'number' ? String(value) : value
  if (!animate || typeof text !== 'string') return value
  const match = NUMERIC.exec(text.trim())
  if (!match) return value
  const [, prefix = '', digits = '', suffix = ''] = match
  const number = Number(digits.replaceAll(',', ''))
  if (!Number.isFinite(number)) return value
  const decimals = digits.split('.')[1]?.length ?? 0
  return (
    <>
      {prefix}
      <AnimatedNumber
        value={number}
        locale="en-US"
        format={{
          useGrouping: digits.includes(','),
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }}
      />
      {suffix}
    </>
  )
}
