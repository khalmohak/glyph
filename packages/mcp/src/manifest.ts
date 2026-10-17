/**
 * The data the MCP server answers from. Generated at build time from the docs (content
 * metadata, examples, extracted props, component styles, guides, changelog) by
 * `apps/docs/scripts/mcp-manifest.mjs`, and shipped in the package so answers are offline
 * and always match the installed Glyph version.
 */

export interface ManifestProp {
  name: string
  type: string
  required: boolean
  defaultValue?: string
  description?: string
}

export interface ManifestExample {
  file: string
  title: string
  description?: string
  code: string
  /** `example` renders live in the docs; `snippet` is setup code shown only. */
  kind: 'example' | 'snippet'
}

/** A component's styles from its `tv()` recipe: what a theme can restyle. */
export interface ManifestStyles {
  /** Export the styles belong to, e.g. `Button`. */
  component: string
  slots: string[]
  variants: Record<string, string[]>
  defaultVariants: Record<string, string>
}

export interface ManifestComponent {
  name: string
  slug: string
  category: string
  status: 'stable' | 'beta' | 'planned'
  description: string
  /** Import path, e.g. `@glyphui/ui` or `@glyphui/ui/data-table`. */
  entry: string
  exports: string[]
  notes: string[]
  radix?: string
  /** Props per component export, primary export first. */
  props: Record<string, ManifestProp[]>
  examples: ManifestExample[]
  styles: ManifestStyles[]
  a11y?: { keyboard: { keys: string; action: string }[]; notes: string[] }
  /** Version the component first shipped in, when known. */
  added?: string
}

export interface ManifestGuide {
  slug: string
  title: string
  description: string
  section: string
  headings: { depth: number; text: string; id: string }[]
  /** The guide as Markdown, with live examples inlined. */
  markdown: string
}

export interface ManifestRelease {
  version: string
  entries: { text: string; packages: string[]; kind: string }[]
}

export interface ManifestPackage {
  name: string
  version: string
  description: string
  /** Import paths, e.g. `@glyphui/ui/form`. */
  entries: string[]
  /** Its stylesheet, when it ships one. */
  stylesheet?: string
  peers: { name: string; range: string; optional: boolean }[]
}

export interface ManifestPreset {
  name: string
  description: string
  primary: { light: string; dark: string }
  fonts: { sans: string; display: string; mono: string }
  radius: Record<string, string>
  motionLevel?: string
  /** Components the preset restyles with recipes. */
  recipes: string[]
}

export interface ManifestTheming {
  /** Token names per group, as the theme schema defines them. */
  tokens: Record<string, string[]>
  presets: ManifestPreset[]
}

export interface Manifest {
  /** Glyph's version: every @glyphui/* package shares it. */
  version: string
  site: { url: string; demoUrl: string; authUrl: string; repo: string }
  packages: ManifestPackage[]
  components: ManifestComponent[]
  guides: ManifestGuide[]
  changelog: ManifestRelease[]
  theming: ManifestTheming
}
