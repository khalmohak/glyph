import { render } from '@testing-library/react'
import { cloneElement, type ReactElement, type ReactNode } from 'react'
import { GlyphProvider } from '../../provider/glyph-provider'

/** Renders with motion off, so recharts draws final shapes immediately. */
export function renderChart(ui: ReactElement) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <GlyphProvider storageKey={null} motion="none">
      {children}
    </GlyphProvider>
  )
  return render(ui, { wrapper })
}

/**
 * jsdom has no layout, so recharts' ResponsiveContainer would draw nothing. Use as
 * `vi.mock('recharts', (original) => import('./test-utils').then((m) => m.mockRecharts(original)))`.
 */
export async function mockRecharts(importOriginal: () => Promise<unknown>) {
  const actual = (await importOriginal()) as typeof import('recharts')
  return {
    ...actual,
    ResponsiveContainer: ({
      children,
      height,
    }: {
      children: ReactElement
      height?: number | string
    }) =>
      cloneElement(children as ReactElement<{ width?: number; height?: number }>, {
        width: 600,
        height: typeof height === 'number' ? height : 300,
      }),
  }
}
