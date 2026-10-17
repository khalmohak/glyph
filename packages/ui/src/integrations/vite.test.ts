import { describe, expect, it } from 'vitest'
import { getColorModeScript } from '../provider/color-mode-script'
import { glyphColorMode } from './vite'

describe('glyphColorMode', () => {
  it('prepends the color-mode script to the head before other transforms', () => {
    const plugin = glyphColorMode()
    expect(plugin.name).toBe('glyph:color-mode')
    expect(plugin.transformIndexHtml.order).toBe('pre')
    expect(plugin.transformIndexHtml.handler()).toEqual([
      { tag: 'script', children: getColorModeScript(), injectTo: 'head-prepend' },
    ])
  })

  it('uses the same options as GlyphProvider', () => {
    const [tag] = glyphColorMode({
      defaultMode: 'dark',
      storageKey: 'acme-mode',
    }).transformIndexHtml.handler()
    expect(tag?.children).toContain('"acme-mode"')
    expect(tag?.children).toContain('d="dark"')
  })

  it('skips localStorage when persistence is off', () => {
    const [tag] = glyphColorMode({ storageKey: null }).transformIndexHtml.handler()
    expect(tag?.children).not.toContain('localStorage')
  })
})
