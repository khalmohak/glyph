import type { RefObject } from 'react'

export interface ExportChartOptions {
  /** Default `png`. */
  format?: 'png' | 'svg'
  /** File name without extension. Default `chart`. */
  fileName?: string
  /** PNG pixel density. Defaults to the screen's devicePixelRatio (at least 2). */
  scale?: number
  /**
   * Background color. Defaults to the chart's surface, so the export reads the same as the
   * page. Pass `"transparent"` for none.
   */
  background?: string
  /** Set false to only return the file, without downloading it. Default true. */
  download?: boolean
  /** Draw the chart's title in the file. Default true. Pass a string to use other text. */
  title?: boolean | string
  /** Draw the chart's legend in the file. Default true. */
  legend?: boolean
}

type Target = Element | RefObject<Element | null> | null | undefined

/** Presentation properties copied from computed styles, so the file needs no stylesheet. */
const PROPERTIES = [
  'fill',
  'fill-opacity',
  'stroke',
  'stroke-opacity',
  'stroke-width',
  'stroke-dasharray',
  'stroke-linecap',
  'stroke-linejoin',
  'opacity',
  'stop-color',
  'stop-opacity',
  'font-family',
  'font-size',
  'font-weight',
  'font-variant-numeric',
  'letter-spacing',
  'text-anchor',
  'dominant-baseline',
  'visibility',
  'display',
] as const

const VAR = /var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*(?:\([^()]*\))?[^()]*))?\)/

/** Replaces `var(--x)` references with their values, read from `element` and its ancestors. */
export function resolveCssVariables(value: string, element: Element, depth = 0): string {
  let result = value
  for (let guard = 0; guard < 32; guard++) {
    const match = VAR.exec(result)
    if (!match) break
    const [whole, name, fallback] = match
    let resolved = ''
    for (let node: Element | null = element; node && !resolved; node = node.parentElement) {
      resolved = getComputedStyle(node).getPropertyValue(name!).trim()
      if (!resolved && node instanceof HTMLElement)
        resolved = node.style.getPropertyValue(name!).trim()
      if (!resolved && node instanceof SVGElement)
        resolved = node.style.getPropertyValue(name!).trim()
    }
    if (!resolved) resolved = fallback?.trim() ?? ''
    if (depth < 8 && resolved.includes('var('))
      resolved = resolveCssVariables(resolved, element, depth + 1)
    result = result.replace(whole, resolved)
  }
  return result
}

function findSvg(target: Target): SVGSVGElement {
  const element = target && 'current' in target ? target.current : target
  if (!element) throw new Error('exportChart: no element to export.')
  if (element instanceof SVGSVGElement) return element
  // The plot's main surface: the largest svg inside the chart.
  const svgs = Array.from(element.querySelectorAll('svg'))
  let best: SVGSVGElement | undefined
  let bestArea = -1
  for (const svg of svgs) {
    const box = svg.getBoundingClientRect()
    const area = box.width * box.height
    if (area > bestArea) {
      best = svg
      bestArea = area
    }
  }
  if (!best) throw new Error('exportChart: the element contains no chart.')
  return best
}

function surfaceColor(svg: Element): string {
  for (let node: Element | null = svg; node; node = node.parentElement) {
    const color = getComputedStyle(node).backgroundColor
    if (color && color !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(color)) return color
  }
  return resolveCssVariables('var(--glyph-surface, #ffffff)', svg)
}

const SVG_NS = 'http://www.w3.org/2000/svg'

export interface SerializeChartOptions {
  /** Background color. Defaults to the chart's surface; `"transparent"` for none. */
  background?: string
  /** Draw the chart's title above it. Default true. Pass a string to use other text. */
  title?: boolean | string
  /** Draw the chart's legend below it. Default true. */
  legend?: boolean
}

function svgElement(name: string, attributes: Record<string, string | number>) {
  const element = document.createElementNS(SVG_NS, name)
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, String(value))
  return element
}

function colorOf(element: Element, property: 'color' | 'backgroundColor'): string {
  const computed = getComputedStyle(element)[property]
  if (computed && !computed.includes('var(')) return computed
  const inline = (element as HTMLElement).style?.[property === 'color' ? 'color' : 'background']
  return inline ? resolveCssVariables(inline, element) : ''
}

/** Content bounds of an svg in its own units, including labels drawn outside it. */
function contentBox(svg: SVGSVGElement, width: number, height: number) {
  const viewBox = svg.getAttribute('viewBox')
  if (viewBox) {
    const [x = 0, y = 0, w = width, h = height] = viewBox.split(/[\s,]+/).map(Number)
    return { x, y, width: w, height: h, scale: width / (w || width) }
  }
  let box = { x: 0, y: 0, width, height }
  try {
    const bounds = svg.getBBox()
    if (bounds.width > 0 && bounds.height > 0) {
      const x = Math.min(0, bounds.x)
      const y = Math.min(0, bounds.y)
      box = {
        x,
        y,
        width: Math.max(width, bounds.x + bounds.width) - x,
        height: Math.max(height, bounds.y + bounds.height) - y,
      }
    }
  } catch {
    // No layout (e.g. jsdom): keep the element's own size.
  }
  return { ...box, scale: 1 }
}

/**
 * Clones a chart's SVG with every theme variable resolved and every style inlined, and adds
 * the chart's title and legend, so the file renders identically outside the page.
 */
export function serializeChart(
  target: Target,
  options: SerializeChartOptions = {},
): {
  svg: string
  width: number
  height: number
} {
  const source = findSvg(target)
  const clone = source.cloneNode(true) as SVGSVGElement
  const originals = [source, ...Array.from(source.querySelectorAll('*'))]
  const copies = [clone, ...Array.from(clone.querySelectorAll('*'))]
  originals.forEach((original, i) => {
    const copy = copies[i]
    if (!copy) return
    const computed = getComputedStyle(original)
    for (const property of PROPERTIES) {
      const attribute = original.getAttribute(property)
      let value = computed.getPropertyValue(property).trim()
      if ((!value || value.includes('var(')) && attribute) value = attribute
      if (!value) continue
      if (value.includes('var(')) value = resolveCssVariables(value, original)
      if (value) copy.setAttribute(property, value)
    }
    const inline = copy.getAttribute('style')
    if (inline?.includes('var(')) copy.setAttribute('style', resolveCssVariables(inline, original))
    copy.removeAttribute('class')
    copy.removeAttribute('tabindex')
    copy.removeAttribute('role')
  })

  const rect = source.getBoundingClientRect()
  const plotWidth = Math.round(rect.width || Number(source.getAttribute('width')) || 600)
  const plotHeight = Math.round(rect.height || Number(source.getAttribute('height')) || 300)
  const box = contentBox(source, plotWidth, plotHeight)
  const innerWidth = Math.round(box.width * box.scale)
  const innerHeight = Math.round(box.height * box.scale)

  const figure = source.closest('[data-slot=chart], [data-slot=gauge]')
  const fontFamily = getComputedStyle(figure ?? source).fontFamily || 'system-ui, sans-serif'
  const pad = 16
  const titleElement = figure?.querySelector('figcaption [id]') ?? null
  const titleText =
    options.title === false
      ? ''
      : typeof options.title === 'string'
        ? options.title
        : (titleElement?.textContent ?? '').trim()
  const header = titleText ? 30 : 0

  const legendItems =
    options.legend === false || !figure
      ? []
      : Array.from(figure.querySelectorAll('[data-slot=chart-legend] li')).map((item) => {
          const swatch = item.querySelector('span[style]')
          const button = item.querySelector('button')
          return {
            label: (item.textContent ?? '').trim(),
            color: swatch ? colorOf(swatch, 'backgroundColor') : '',
            hidden: button?.getAttribute('aria-pressed') === 'false',
            text: colorOf(item, 'color') || colorOf(figure, 'color'),
          }
        })
  const legendRows: { x: number; row: number; item: (typeof legendItems)[number] }[] = []
  let cursor = 0
  let row = 0
  for (const item of legendItems) {
    const itemWidth = 16 + item.label.length * 6.6 + 16
    if (cursor > 0 && cursor + itemWidth > innerWidth) {
      cursor = 0
      row++
    }
    legendRows.push({ x: cursor, row, item })
    cursor += itemWidth
  }
  const legendHeight = legendItems.length > 0 ? (row + 1) * 20 + 8 : 0

  const width = innerWidth + pad * 2
  const height = pad + header + innerHeight + legendHeight + pad
  const root = svgElement('svg', {
    xmlns: SVG_NS,
    width,
    height,
    viewBox: `0 0 ${width} ${height}`,
    'font-family': fontFamily,
  })
  const fill = options.background ?? surfaceColor(source)
  if (fill !== 'transparent') root.append(svgElement('rect', { x: 0, y: 0, width, height, fill }))
  if (titleText) {
    const title = svgElement('text', {
      x: pad,
      y: pad + 14,
      'font-size': 14,
      'font-weight': 600,
      fill: titleElement ? colorOf(titleElement, 'color') : colorOf(source, 'color'),
    })
    title.textContent = titleText
    root.append(title)
  }
  clone.removeAttribute('style')
  clone.setAttribute('x', String(pad))
  clone.setAttribute('y', String(pad + header))
  clone.setAttribute('width', String(innerWidth))
  clone.setAttribute('height', String(innerHeight))
  clone.setAttribute('viewBox', `${box.x} ${box.y} ${box.width} ${box.height}`)
  clone.setAttribute('overflow', 'visible')
  root.append(clone)
  for (const { x, row: line, item } of legendRows) {
    const y = pad + header + innerHeight + 12 + line * 20
    const group = svgElement('g', { opacity: item.hidden ? 0.45 : 1 })
    group.append(
      svgElement('rect', { x: pad + x, y: y, width: 10, height: 10, rx: 2, fill: item.color }),
    )
    const label = svgElement('text', {
      x: pad + x + 16,
      y: y + 9,
      'font-size': 12,
      fill: item.text,
    })
    label.textContent = item.label
    group.append(label)
    root.append(group)
  }
  return { svg: new XMLSerializer().serializeToString(root), width, height }
}

function save(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/**
 * Downloads a chart as PNG or SVG, with the theme's colors baked in. Pass the chart's
 * element (or a ref to it, or to any wrapper such as a ChartCard). Resolves with the file.
 */
export async function exportChart(target: Target, options: ExportChartOptions = {}): Promise<Blob> {
  const { format = 'png', fileName = 'chart', download = true } = options
  const { svg, width, height } = serializeChart(target, {
    ...(options.background !== undefined && { background: options.background }),
    ...(options.title !== undefined && { title: options.title }),
    ...(options.legend !== undefined && { legend: options.legend }),
  })
  let blob: Blob
  if (format === 'svg') {
    blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  } else {
    const scale = options.scale ?? Math.max(window.devicePixelRatio || 1, 2)
    const image = new Image()
    image.decoding = 'async'
    const loaded = new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () => reject(new Error('exportChart: the chart could not be rendered.'))
    })
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
    await loaded
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(width * scale)
    canvas.height = Math.round(height * scale)
    const context = canvas.getContext('2d')
    if (!context) throw new Error('exportChart: canvas is not available.')
    context.scale(scale, scale)
    context.drawImage(image, 0, 0, width, height)
    blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (result) =>
          result ? resolve(result) : reject(new Error('exportChart: PNG encoding failed.')),
        'image/png',
      ),
    )
  }
  if (download) save(blob, `${fileName}.${format}`)
  return blob
}
