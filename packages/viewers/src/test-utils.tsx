import { GlyphProvider } from '@glyphui/ui'
import { render } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { vi } from 'vitest'

function Providers({ children }: { children: ReactNode }) {
  return (
    <GlyphProvider storageKey={null} motion="none">
      {children}
    </GlyphProvider>
  )
}

/** Renders inside GlyphProvider with motion off, as apps do. `rerender` keeps the provider. */
export function renderWithGlyph(ui: ReactElement) {
  return render(ui, { wrapper: Providers })
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
