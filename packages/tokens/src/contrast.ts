/**
 * WCAG contrast checks for theme colors. Parses `oklch()`, `#hex` and `rgb()` colors and
 * `color-mix(in oklab, …)` of two of them, the formats Glyph themes and components use.
 */

type Oklab = readonly [l: number, a: number, b: number]

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

function parseNumber(token: string, percentScale: number): number {
  const value = Number.parseFloat(token)
  return token.trim().endsWith('%') ? (value / 100) * percentScale : value
}

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function linearSrgbToOklab([r, g, b]: readonly [number, number, number]): Oklab {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

function oklabToLinearSrgb([L, a, b]: Oklab): [number, number, number] {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
}

function splitArgs(inner: string): string[] {
  const parts: string[] = []
  let depth = 0
  let current = ''
  for (const char of inner) {
    if (char === '(') depth++
    if (char === ')') depth--
    if (char === ',' && depth === 0) {
      parts.push(current.trim())
      current = ''
    } else current += char
  }
  parts.push(current.trim())
  return parts
}

/** Parses a CSS color into OKLab. Throws on formats it does not understand. */
export function parseColor(input: string): Oklab {
  const color = input.trim().toLowerCase()

  if (color.startsWith('oklch(')) {
    const [l = '0', c = '0', h = '0'] = color.slice(6, -1).split('/')[0]!.trim().split(/\s+/)
    const L = parseNumber(l, 1)
    const C = parseNumber(c, 0.4)
    const H = (Number.parseFloat(h) * Math.PI) / 180
    return [L, C * Math.cos(H), C * Math.sin(H)]
  }

  if (color.startsWith('#')) {
    const hex = color.slice(1)
    const full = hex.length <= 4 ? [...hex].map((ch) => ch + ch).join('') : hex
    const channels = [0, 2, 4].map((i) => Number.parseInt(full.slice(i, i + 2), 16) / 255)
    return linearSrgbToOklab(channels.map(srgbToLinear) as [number, number, number])
  }

  if (color.startsWith('rgb')) {
    const inner = color.slice(color.indexOf('(') + 1, -1).split('/')[0]!
    const channels = inner
      .split(/[\s,]+/)
      .filter(Boolean)
      .slice(0, 3)
      .map((v) => clamp01(parseNumber(v, 255) / 255))
    return linearSrgbToOklab(channels.map(srgbToLinear) as [number, number, number])
  }

  if (color.startsWith('color-mix(')) {
    const [space, first, second] = splitArgs(color.slice(10, -1))
    if (space !== 'in oklab') throw new Error(`Only color-mix(in oklab, …) is supported: ${input}`)
    const weighted = (part: string) => {
      const match = part.match(/^(.*?)\s+(\d+(?:\.\d+)?)%$/)
      return match ? { color: match[1]!, weight: Number(match[2]) / 100 } : { color: part }
    }
    const a = weighted(first!)
    const b = weighted(second!)
    const wa = a.weight ?? (b.weight === undefined ? 0.5 : 1 - b.weight)
    const ca = parseColor(a.color)
    const cb = parseColor(b.color)
    return [0, 1, 2].map((i) => ca[i]! * wa + cb[i]! * (1 - wa)) as unknown as Oklab
  }

  throw new Error(`Unsupported color format: ${input}`)
}

function toSrgb(color: string): [number, number, number] {
  const linear = oklabToLinearSrgb(parseColor(color)).map(clamp01)
  return linear.map((c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)) as [
    number,
    number,
    number,
  ]
}

/**
 * `color` at `alpha` opacity painted over `backdrop`, as the browser composites it (in sRGB).
 * This is what Tailwind's `bg-danger/14` looks like on the page. Returns an `rgb()` color.
 */
export function composite(color: string, alpha: number, backdrop: string): string {
  const top = toSrgb(color)
  const bottom = toSrgb(backdrop)
  const [r, g, b] = top.map((c, i) => Math.round((c * alpha + bottom[i]! * (1 - alpha)) * 255))
  return `rgb(${r} ${g} ${b})`
}

/** WCAG 2 relative luminance of a CSS color (out-of-gamut colors are clipped to sRGB). */
export function relativeLuminance(color: string): number {
  const [r, g, b] = oklabToLinearSrgb(parseColor(color)).map(clamp01) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG 2 contrast ratio between two CSS colors, from 1 to 21. */
export function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground)
  const b = relativeLuminance(background)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

/** Perceptual distance between two colors (Euclidean in OKLab). Around 0.1 reads as clearly different. */
export function colorDistance(first: string, second: string): number {
  const a = parseColor(first)
  const b = parseColor(second)
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
}
