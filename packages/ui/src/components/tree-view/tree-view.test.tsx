import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { type TreeNode, TreeView } from './tree-view'

const nodes: TreeNode[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      { id: 'app', label: 'app.tsx' },
      { id: 'main', label: 'main.tsx' },
    ],
  },
  { id: 'readme', label: 'README.md' },
]

describe('TreeView', () => {
  it('exposes tree semantics with a single tabbable item', () => {
    render(<TreeView aria-label="Files" nodes={nodes} />)
    expect(screen.getByRole('tree', { name: 'Files' })).toBeInTheDocument()
    const items = screen.getAllByRole('treeitem')
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveAttribute('aria-expanded', 'false')
    expect(items[0]).toHaveAttribute('tabindex', '0')
    expect(items[1]).toHaveAttribute('tabindex', '-1')
  })

  it('expands, moves and selects with the keyboard', async () => {
    const onSelect = vi.fn()
    render(<TreeView aria-label="Files" nodes={nodes} onSelect={onSelect} />)
    await userEvent.tab()
    expect(screen.getByRole('treeitem', { name: 'src' })).toHaveFocus()

    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('treeitem', { name: 'src' })).toHaveAttribute('aria-expanded', 'true')

    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('treeitem', { name: 'app.tsx' })).toHaveFocus()

    await userEvent.keyboard('{ArrowDown}{Enter}')
    expect(onSelect).toHaveBeenCalledWith('main', expect.objectContaining({ id: 'main' }))
    expect(screen.getByRole('treeitem', { name: 'main.tsx' })).toHaveAttribute(
      'aria-selected',
      'true',
    )

    await userEvent.keyboard('{ArrowLeft}')
    expect(screen.getByRole('treeitem', { name: 'src' })).toHaveFocus()

    await userEvent.keyboard('{ArrowLeft}')
    expect(screen.getByRole('treeitem', { name: 'src' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('finds items by typing their first letter', async () => {
    render(<TreeView aria-label="Files" nodes={nodes} />)
    await userEvent.tab()
    await userEvent.keyboard('r')
    expect(screen.getByRole('treeitem', { name: 'README.md' })).toHaveFocus()
  })

  it('toggles a parent when its row is clicked', async () => {
    render(<TreeView aria-label="Files" nodes={nodes} defaultExpanded={['src']} />)
    expect(screen.getByRole('treeitem', { name: 'app.tsx' })).toBeInTheDocument()
    await userEvent.click(screen.getByText('src'))
    expect(screen.queryByRole('treeitem', { name: 'app.tsx' })).not.toBeInTheDocument()
  })
})
