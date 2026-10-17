// @vitest-environment node
import { GlyphProvider } from '@glyphui/ui'
import type { ComponentType } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'

/**
 * Every docs example must render on the server (Next.js, Remix, React Router SSR): no
 * window, document or storage access during render, and no NaN in the output.
 */
const examples = import.meta.glob<{ default: ComponentType }>('./content/*/examples/*.tsx')

describe('server rendering', () => {
  it.each(Object.keys(examples).sort())('%s', async (path) => {
    const errors: unknown[] = []
    const spy = vi.spyOn(console, 'error').mockImplementation((...args) => errors.push(args))
    const { default: Example } = await examples[path]!()
    const html = renderToString(
      <MemoryRouter>
        <GlyphProvider storageKey={null}>
          <Example />
        </GlyphProvider>
      </MemoryRouter>,
    )
    spy.mockRestore()
    expect(html.length).toBeGreaterThan(0)
    expect(html).not.toContain('NaN')
    expect(errors).toEqual([])
  })
})
