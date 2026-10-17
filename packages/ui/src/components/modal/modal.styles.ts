import type { StylesEntry } from '../../utils/registry'
import { tv } from '../../utils/tv'

/** Modal is built from Dialog parts; these slots add Modal-specific classes on top. */
export const modalStyles = /* @__PURE__ */ tv({
  slots: {
    content: '',
    header: '',
    body: 'grid gap-4',
    footer: '',
    /** Wraps body and footer when `onSubmit` is set; `contents` keeps the dialog layout. */
    form: 'contents',
  },
})

declare module '@glyphui/tokens' {
  interface GlyphComponentRegistry {
    Modal: StylesEntry<typeof modalStyles>
  }
}
