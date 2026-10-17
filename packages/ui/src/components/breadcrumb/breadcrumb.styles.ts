import type { StylesEntry } from '../../utils/registry'
import { focusRing, transition } from '../../utils/styles'
import { tv } from '../../utils/tv'

export const breadcrumbStyles = /* @__PURE__ */ tv({
  slots: {
    root: 'min-w-0',
    list: 'flex flex-wrap items-center gap-1.5 text-small text-muted-foreground',
    item: 'inline-flex min-w-0 items-center gap-1.5',
    link: ['truncate rounded-xs hover:text-foreground', transition, focusRing],
    page: 'truncate font-medium text-foreground',
    separator: 'flex items-center text-faint-foreground [&>svg]:size-3.5',
  },
})

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    Breadcrumb: StylesEntry<typeof breadcrumbStyles>
  }
}
