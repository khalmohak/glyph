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

// Ambient modules can't import types by relative path, so these are typed in src/lib/content.ts.
declare module 'virtual:glyph-guides' {
  const guides: unknown
  export default guides
}

declare module 'virtual:glyph-changelog' {
  const changelog: unknown
  export default changelog
}

declare module 'virtual:glyph-releases' {
  /** Release versions, newest first. */
  const releases: string[]
  export default releases
}

declare module 'virtual:glyph-examples' {
  /** Keyed by `<slug>/<file>`. */
  const examples: Record<string, { code: string; html: string }>
  export default examples
}
