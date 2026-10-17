import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
  vi.resetModules()
  document.head.innerHTML = ''
})

/** Mounts a component that runs the check, with fresh module state for each test. */
async function mountBlock() {
  const { useBlocksStylesCheck } = await import('./styles-check')
  function Block() {
    useBlocksStylesCheck()
    return null
  }
  render(<Block />)
  render(<Block />)
}

describe('blocks stylesheet check', () => {
  it('warns once in development when the stylesheet is missing', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    await mountBlock()
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0]?.[0]).toContain('@import "@glyphui/blocks/styles.css";')
  })

  it('stays quiet when the stylesheet is loaded', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    const style = document.createElement('style')
    style.textContent = ':root { --glyph-blocks-css: 1; }'
    document.head.append(style)
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    await mountBlock()
    expect(warn).not.toHaveBeenCalled()
  })

  it('never runs in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    await mountBlock()
    expect(warn).not.toHaveBeenCalled()
  })
})
