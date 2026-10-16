import type { LinkComponentProps } from '@glyphui/ui'
import { Link } from 'react-router'

/** Glyph's navigation components render links through this, so they use client-side routing. */
export function RouterLink({ href, ...props }: LinkComponentProps) {
  if (/^(https?:|mailto:|#)/.test(href)) return <a href={href} {...props} />
  return <Link to={href} {...props} />
}
