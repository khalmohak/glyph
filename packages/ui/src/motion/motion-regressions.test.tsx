import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { GlyphProvider } from '../provider/glyph-provider'
import { installIntersectionObserver } from '../test/intersection-observer'
import { AnimatedNumber } from './animated-number'
import { PageTransition } from './page-transition'

describe('motion regressions', () => {
  let restore: () => void
  beforeEach(() => {
    restore = installIntersectionObserver()
  })
  afterEach(() => restore())

  it('does not replay the entrance of the first page when it re-renders', () => {
    const view = (key: string, children: ReactNode) => (
      <PageTransition transitionKey={key} data-testid="page">
        {children}
      </PageTransition>
    )
    const { rerender } = render(view('/a', 'one'))
    rerender(view('/a', 'two'))
    expect(screen.getByTestId('page')).not.toHaveClass('animate-page-in')
    rerender(view('/b', 'three'))
    expect(screen.getByTestId('page')).toHaveClass('animate-page-in')
  })

  it('keeps the shown number when motion turns on later, instead of counting from zero', () => {
    const view = (motion: 'none' | 'subtle') => (
      <GlyphProvider storageKey={null} motion={motion}>
        <AnimatedNumber value={1250} data-testid="n" />
      </GlyphProvider>
    )
    const { rerender } = render(view('none'))
    expect(screen.getByTestId('n')).toHaveTextContent('1,250')
    rerender(view('subtle'))
    // The visible text (screen readers get the final value separately while counting).
    const visible = screen.getByTestId('n').querySelector('[aria-hidden="true"]')
    expect(visible?.textContent ?? screen.getByTestId('n').textContent).toBe('1,250')
  })

  it('renders a value that is not a finite number without animating it', () => {
    render(
      <GlyphProvider storageKey={null} motion="subtle">
        <AnimatedNumber value={Number.NaN} formatValue={() => '—'} data-testid="n" />
      </GlyphProvider>,
    )
    const node = screen.getByTestId('n')
    expect(node).toHaveTextContent(/^—$/)
    expect(node.querySelector('[aria-hidden="true"]')).toBeNull()
  })
})
