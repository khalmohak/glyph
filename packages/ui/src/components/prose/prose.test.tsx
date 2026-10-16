import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Prose } from './prose'

describe('Prose', () => {
  it('wraps raw content and keeps its semantics', () => {
    render(
      <Prose>
        <h2>Typography matters</h2>
        <p>
          Read the <a href="/guide">guide</a>.
        </p>
      </Prose>,
    )
    expect(
      screen.getByRole('heading', { level: 2, name: 'Typography matters' }),
    ).toBeInTheDocument()
    const root = screen.getByRole('heading').parentElement!
    expect(root).toHaveAttribute('data-slot', 'prose')
    expect(root.className).toContain('max-w-prose')
  })

  it('renders as the child element with asChild', () => {
    render(
      <Prose asChild fullWidth>
        <article>Body</article>
      </Prose>,
    )
    const article = screen.getByRole('article')
    expect(article).toHaveAttribute('data-slot', 'prose')
    expect(article.className).toContain('max-w-none')
  })
})
