import type { StylesEntry } from '../../utils/registry'
import { tv } from '../../utils/tv'

/** Modal is built from Dialog parts; these slots add Modal-specific classes on top. */
export const modalStyles = tv({
  slots: {
    content: '',
    header: '',
    body: 'grid gap-4',
    footer: '',
  },
})

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    Modal: StylesEntry<typeof modalStyles>
  }
}
