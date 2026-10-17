import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useElementWidth } from './use-element-width'

function Probe({ ready }: { ready: boolean }) {
  const [ref, width] = useElementWidth<HTMLDivElement>()
  // Like a chart that shows a loading state first: the measured element isn't there yet.
  if (!ready) return <p>Loading…</p>
  return (
    <div ref={ref} data-testid="plot">
      {width}
    </div>
  )
}

afterEach(() => vi.restoreAllMocks())

// Relay finding U1: charts that first rendered loading or empty never measured, so they kept
// the 480px fallback and overflowed narrow cards.
describe('useElementWidth', () => {
  it('measures an element that appears after the first render', () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      width: 312,
    } as DOMRect)
    const { rerender } = render(<Probe ready={false} />)
    rerender(<Probe ready />)
    expect(screen.getByTestId('plot')).toHaveTextContent('312')
  })
})
