/**
 * The theme studio's model: a small, serializable set of overrides on top of a preset, turned
 * into a real theme (for the live preview and the site), a `glyph.theme.ts` file, and a URL.
 * Plain data and functions only, so it is easy to test.
 */
import {
  type ColorMode,
  type ColorToken,
  type ContrastIssue,
  colorDistance,
  contrastRatio,
  deriveForeground,
  type ExtendedThemeInput,
  type MotionLevel,
  minChartDistance,
  parseColor,
  type Theme,
} from '@glyphui/tokens'
import { defineTheme, type PresetName, presets } from '@glyphui/ui'

export const presetNames = Object.keys(presets) as PresetName[]

/** Color tokens the studio edits. The rest (foregrounds, text colors) follow automatically. */
export const editableColors = [
  'background',
  'surface',
  'foreground',
  'muted-foreground',
  'border',
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'chart-1',
  'chart-2',
  'chart-3',
  'chart-4',
  'chart-5',
] as const satisfies readonly ColorToken[]
export type EditableColor = (typeof editableColors)[number]

export const radiusSteps = ['sm', 'md', 'lg', 'xl'] as const
export type RadiusStep = (typeof radiusSteps)[number]

export const shadowStyles = ['none', 'soft', 'layered', 'hard'] as const
export type ShadowStyle = (typeof shadowStyles)[number]

export const densities = ['compact', 'default', 'comfortable'] as const
export type Density = (typeof densities)[number]

export interface FontOption {
  label: string
  stack: string
}

/** Fonts the docs load, so every choice previews for real. */
export const fonts = {
  sans: [
    { label: 'Geist', stack: '"Geist Variable", "Geist", ui-sans-serif, system-ui, sans-serif' },
    { label: 'Inter', stack: '"Inter Variable", "Inter", ui-sans-serif, system-ui, sans-serif' },
    {
      label: 'Archivo',
      stack: '"Archivo Variable", "Archivo", ui-sans-serif, system-ui, sans-serif',
    },
    { label: 'Nunito', stack: '"Nunito Variable", "Nunito", ui-rounded, system-ui, sans-serif' },
    { label: 'System', stack: 'ui-sans-serif, system-ui, sans-serif' },
  ],
  display: [
    { label: 'Geist', stack: '"Geist Variable", "Geist", ui-sans-serif, system-ui, sans-serif' },
    { label: 'Inter', stack: '"Inter Variable", "Inter", ui-sans-serif, system-ui, sans-serif' },
    {
      label: 'Archivo Black',
      stack: '"Archivo Black", "Archivo Variable", ui-sans-serif, sans-serif',
    },
    {
      label: 'Newsreader',
      stack: '"Newsreader Variable", "Newsreader", ui-serif, Georgia, serif',
    },
    {
      label: 'Bricolage Grotesque',
      stack: '"Bricolage Grotesque Variable", "Nunito Variable", ui-sans-serif, sans-serif',
    },
  ],
  mono: [
    {
      label: 'Geist Mono',
      stack: '"Geist Mono Variable", "Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
    },
    { label: 'Space Mono', stack: '"Space Mono", ui-monospace, monospace' },
    { label: 'System', stack: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
  ],
} as const satisfies Record<'sans' | 'display' | 'mono', readonly FontOption[]>

export type FontRole = keyof typeof fonts

/** Everything the studio can change. Unset fields keep the preset's value. */
export interface StudioState {
  base: PresetName
  name?: string
  /** Usually the editable colors; contrast fixes may also set derived ones (foregrounds). */
  colors?: Partial<Record<ColorMode, Partial<Record<ColorToken, string>>>>
  font?: Partial<Record<FontRole, string>>
  /** Display headline tracking, e.g. `-0.04em`. */
  tracking?: string
  /** Display headline weight, e.g. `700`. */
  weight?: string
  radius?: Partial<Record<RadiusStep, number>>
  borderWidth?: number
  shadow?: ShadowStyle
  density?: Density
  motion?: { level?: MotionLevel; stiffness?: number; damping?: number }
}

const shadowSets: Record<ShadowStyle, ExtendedThemeInput['shadow']> = {
  none: { xs: 'none', sm: 'none', md: 'none', lg: 'none' },
  soft: {
    light: {
      xs: '0 1px 2px oklch(25% 0.02 260 / 0.04)',
      sm: '0 1px 3px oklch(25% 0.02 260 / 0.06)',
      md: '0 4px 14px oklch(25% 0.02 260 / 0.07)',
      lg: '0 12px 32px oklch(25% 0.02 260 / 0.09)',
    },
    dark: {
      xs: '0 1px 2px oklch(0% 0 0 / 0.3)',
      sm: '0 1px 3px oklch(0% 0 0 / 0.35)',
      md: '0 4px 14px oklch(0% 0 0 / 0.35)',
      lg: '0 12px 32px oklch(0% 0 0 / 0.45)',
    },
  },
  layered: presets.glyph.shadow,
  hard: {
    xs: '2px 2px 0 0 var(--glyph-border)',
    sm: '3px 3px 0 0 var(--glyph-border)',
    md: '5px 5px 0 0 var(--glyph-border)',
    lg: '8px 8px 0 0 var(--glyph-border)',
  },
}

const controlHeights: Record<Density, { sm: string; md: string; lg: string }> = {
  compact: { sm: '28px', md: '32px', lg: '38px' },
  default: { sm: '30px', md: '36px', lg: '42px' },
  comfortable: { sm: '34px', md: '40px', lg: '46px' },
}

const px = (n: number) => `${n}px`

/** The theme input the studio state stands for: the preset plus only what changed. */
export function toThemeInput(state: StudioState): ExtendedThemeInput {
  const input: ExtendedThemeInput = { name: state.name || 'custom', extends: presets[state.base] }
  const colors = cleanColors(state.colors)
  if (colors) input.colors = colors
  if (state.font && Object.keys(state.font).length) input.font = { ...state.font }
  if (state.tracking !== undefined || state.weight !== undefined)
    input.text = {
      display: {
        ...(state.tracking !== undefined && { tracking: state.tracking }),
        ...(state.weight !== undefined && { weight: state.weight }),
      },
    }
  if (state.radius && Object.keys(state.radius).length)
    input.radius = Object.fromEntries(
      Object.entries(state.radius).map(([step, value]) => [step, px(value)]),
    )
  if (state.borderWidth !== undefined) input.border = { width: px(state.borderWidth) }
  if (state.shadow) input.shadow = shadowSets[state.shadow]
  if (state.density) input.control = controlHeights[state.density]
  if (state.motion && Object.keys(state.motion).length) {
    const { level, stiffness, damping } = state.motion
    const spring = presets[state.base].motion.spring
    input.motion = {
      ...(level && { level }),
      ...((stiffness !== undefined || damping !== undefined) && {
        spring: {
          stiffness: stiffness ?? spring?.stiffness ?? 420,
          damping: damping ?? spring?.damping ?? 34,
        },
      }),
    }
  }
  return input
}

function cleanColors(colors: StudioState['colors']) {
  if (!colors) return undefined
  const out: Partial<Record<ColorMode, Record<string, string>>> = {}
  for (const mode of ['light', 'dark'] as const) {
    const entries = Object.entries(colors[mode] ?? {}).filter(([, v]) => v && v.trim() !== '')
    if (entries.length) out[mode] = Object.fromEntries(entries)
  }
  return Object.keys(out).length ? (out as ExtendedThemeInput['colors']) : undefined
}

/** The live theme. Throws on unparseable values only when the contrast audit runs. */
export function buildTheme(state: StudioState): Theme {
  return defineTheme(toThemeInput(state))
}

/** True when nothing differs from the preset. */
export function isPristine(state: StudioState): boolean {
  const { base: _base, ...rest } = state
  return JSON.stringify(compact(rest)) === '{}'
}

/** Drops empty objects and undefined values, so URLs and comparisons stay small. */
function compact<T>(value: T): T {
  if (Array.isArray(value) || value === null || typeof value !== 'object') return value
  const out: Record<string, unknown> = {}
  for (const [key, v] of Object.entries(value)) {
    const next = compact(v)
    if (next === undefined || next === '') continue
    if (typeof next === 'object' && next !== null && Object.keys(next).length === 0) continue
    out[key] = next
  }
  return out as T
}

// ---------- glyph.theme.ts ----------

const identifier = /^[A-Za-z_$][\w$]*$/

function literal(value: unknown, indent: string): string {
  if (typeof value === 'string') return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (value && typeof value === 'object') {
    const inner = `${indent}  `
    const lines = Object.entries(value).map(
      ([key, v]) => `${inner}${identifier.test(key) ? key : `'${key}'`}: ${literal(v, inner)},`,
    )
    return `{\n${lines.join('\n')}\n${indent}}`
  }
  return 'undefined'
}

/** A ready-to-use `glyph.theme.ts`: `defineTheme` extending the preset with the overrides. */
export function themeFile(state: StudioState): string {
  const { extends: _base, name, ...overrides } = toThemeInput(state)
  const lines = [
    "import { defineTheme, presets } from '@glyphui/ui'",
    '',
    'export default defineTheme({',
    `  name: ${literal(name, '  ')},`,
    `  extends: presets.${state.base},`,
    ...Object.entries(overrides).map(([key, value]) => `  ${key}: ${literal(value, '  ')},`),
    '})',
  ]
  return `${lines.join('\n')}\n`
}

// ---------- URL state ----------

/** `?t=` value: the compacted state as base64url JSON. */
export function encodeState(state: StudioState): string {
  const json = JSON.stringify(compact(state))
  const bytes = new TextEncoder().encode(json)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** Reads `?t=`. Unknown or broken values give `null`, never an exception. */
export function decodeState(value: string | null | undefined): StudioState | null {
  if (!value) return null
  try {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
    const binary = atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4))
    const json = new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)))
    const parsed = JSON.parse(json) as StudioState
    if (!parsed || typeof parsed !== 'object' || !presetNames.includes(parsed.base)) return null
    return parsed
  } catch {
    return null
  }
}

// ---------- colors ----------

export interface Oklch {
  l: number
  c: number
  h: number
}

/** Any CSS color the token parser understands, as OKLCH. `null` if it can't be read. */
export function toOklch(color: string): Oklch | null {
  try {
    const [l, a, b] = parseColor(color)
    const c = Math.hypot(a, b)
    const h = ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360
    return { l, c, h: c < 0.002 ? 0 : h }
  } catch {
    return null
  }
}

const round = (n: number, digits: number) => Number(n.toFixed(digits))

export function formatOklch({ l, c, h }: Oklch): string {
  return `oklch(${round(l * 100, 1)}% ${round(c, 3)} ${round(h, 1)})`
}

export function isValidColor(color: string): boolean {
  return toOklch(color) !== null
}

/** A small palette of brand colors that read well in both modes. */
export const palette = [
  'oklch(62% 0.19 255)',
  'oklch(58% 0.22 290)',
  'oklch(62% 0.21 330)',
  'oklch(62% 0.22 25)',
  'oklch(70% 0.17 55)',
  'oklch(78% 0.16 85)',
  'oklch(66% 0.17 145)',
  'oklch(64% 0.12 185)',
  'oklch(60% 0.13 220)',
  'oklch(25% 0.01 260)',
] as const

// ---------- contrast fixes ----------

/**
 * A replacement for `token` in `mode` that passes every background it failed on. Solid-tone
 * foregrounds become white or dark ink; other colors keep their hue and chroma and move in
 * lightness just far enough; chart colors rotate hue until they separate.
 */
export function fixColor(theme: Theme, issues: ContrastIssue[], issue: ContrastIssue): string {
  const colors = theme.colors[issue.mode]
  const token = issue.foreground
  const current = colors[token]
  if (issue.kind === 'chart-distance') {
    const start = toOklch(current)
    if (!start) return current
    const other = colors[issue.background as ColorToken] ?? issue.background
    for (let step = 1; step <= 11; step++) {
      const candidate = formatOklch({ ...start, h: (start.h + step * 30) % 360 })
      if (colorDistance(candidate, other) >= minChartDistance + 0.02) return candidate
    }
    return current
  }
  if (token.endsWith('-foreground') && token !== 'muted-foreground' && token !== 'faint-foreground')
    return deriveForeground(colors[token.replace(/-foreground$/, '') as ColorToken], current)

  const backgrounds = issues
    .filter((i) => i.mode === issue.mode && i.foreground === token && i.kind !== 'chart-distance')
    .map((i) => ({ bg: i.background, required: i.required }))
  const start = toOklch(current)
  if (!start) return current
  const passes = (color: string) =>
    backgrounds.every(({ bg, required }) => contrastRatio(color, bg) >= required + 0.05)
  // Try lightness steps in both directions; take the closest one that passes.
  for (let delta = 0.01; delta <= 1; delta += 0.01) {
    for (const l of [start.l - delta, start.l + delta]) {
      if (l < 0 || l > 1) continue
      const candidate = formatOklch({ ...start, l })
      if (passes(candidate)) return candidate
    }
  }
  return current
}
