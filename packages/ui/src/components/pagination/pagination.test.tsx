import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Pagination } from './pagination'
import { paginationRange } from './pagination-range'

describe('paginationRange', () => {
  it('lists every page when they fit', () => {
    expect(paginationRange(1, 5)).toEqual([1, 2, 3, 4, 5])
    expect(paginationRange(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('collapses the far side near the start and end', () => {
    expect(paginationRange(1, 20)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 20])
    expect(paginationRange(20, 20)).toEqual([1, 'ellipsis', 16, 17, 18, 19, 20])
  })

  it('shows both gaps in the middle and keeps a constant length', () => {
    expect(paginationRange(10, 20)).toEqual([1, 'ellipsis', 9, 10, 11, 'ellipsis', 20])
    for (let page = 1; page <= 20; page++) expect(paginationRange(page, 20)).toHaveLength(7)
  })

  it('respects siblingCount and clamps out-of-range input', () => {
    expect(paginationRange(10, 20, 2)).toEqual([1, 'ellipsis', 8, 9, 10, 11, 12, 'ellipsis', 20])
    expect(paginationRange(99, 3)).toEqual([1, 2, 3])
    expect(paginationRange(1, 0)).toEqual([])
  })
})

describe('Pagination', () => {
  it('marks the current page and reports page changes', async () => {
    const onPageChange = vi.fn()
    render(<Pagination page={3} pageCount={10} onPageChange={onPageChange} />)
    expect(screen.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page')
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(onPageChange).toHaveBeenLastCalledWith(4)
    await userEvent.click(screen.getByRole('button', { name: 'Page 10' }))
    expect(onPageChange).toHaveBeenLastCalledWith(10)
  })

  it('disables previous and first on the first page', () => {
    render(<Pagination page={1} pageCount={5} />)
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'First page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled()
  })

  it('renders links when getHref is given', () => {
    render(<Pagination page={2} pageCount={5} getHref={(p) => `?page=${p}`} />)
    expect(screen.getByRole('link', { name: 'Page 4' })).toHaveAttribute('href', '?page=4')
    expect(screen.getByRole('link', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page')
  })
})
