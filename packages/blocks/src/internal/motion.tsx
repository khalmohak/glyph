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
  const format: Intl.NumberFormatOptions = {
    useGrouping: digits.includes(','),
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }
  // Only count up when the number reads back exactly as written: "007", ".5", "00:05" or
  // "1,2,3" would otherwise end on different text ("7", "0.5", "0:05", "123").
  if (new Intl.NumberFormat('en-US', format).format(number) !== digits) return value
  return (
    <>
      {prefix}
      <AnimatedNumber value={number} locale="en-US" format={format} />
      {suffix}
    </>
  )
}
