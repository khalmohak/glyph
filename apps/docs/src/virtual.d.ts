declare module 'virtual:glyph-props' {
  import type { PropDoc } from '../plugins/docs-data'

  const props: Record<string, PropDoc[]>
  export default props
}

declare module 'virtual:glyph-sizes' {
  /** Gzipped bytes of each component imported on its own, keyed by docs slug. */
  const sizes: Record<string, number>
  export default sizes
}

declare module 'virtual:glyph-examples' {
  /** Keyed by `<slug>/<file>`. */
  const examples: Record<string, { code: string; html: string }>
  export default examples
}
