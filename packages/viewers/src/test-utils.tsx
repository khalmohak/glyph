import { GlyphProvider } from '@glyphui/ui'
import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { vi } from 'vitest'

/** Renders inside GlyphProvider with motion off, as apps do. */
export function renderWithGlyph(ui: ReactElement) {
  return render(
    <GlyphProvider storageKey={null} motion="none">
      {ui}
    </GlyphProvider>,
  )
}

/** A virtualizer for jsdom (no layout): renders the first `limit` rows. */
export function firstRowsVirtualizer(limit = 60) {
  return {
    virtualRows: () => ({
      height: 400,
      useVirtualRows: ({ count, estimateSize }: { count: number; estimateSize: number }) => ({
        items: Array.from({ length: Math.min(count, limit) }, (_, i) => ({
          index: i,
          start: i * estimateSize,
          end: (i + 1) * estimateSize,
          key: i,
        })),
        totalSize: count * estimateSize,
        measureElement: () => {},
      }),
    }),
  }
}

/** A Response-like object for mocking `fetch`. */
export function mockFetch(body: BodyInit, init: ResponseInit = {}) {
  return vi.fn(async () => new Response(body, init))
}
