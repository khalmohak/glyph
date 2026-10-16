declare module 'virtual:glyph-props' {
  import type { PropDoc } from '../plugins/docs-data'

  const props: Record<string, PropDoc[]>
  export default props
}

declare module 'virtual:glyph-examples' {
  /** Keyed by `<slug>/<file>`. */
  const examples: Record<string, { code: string; html: string }>
  export default examples
}
