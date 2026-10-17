import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderWithGlyph } from '../test-utils'
import { JsonViewer } from './json-viewer'

const data = {
  workspace: { name: 'Ledgerline', plan: 'growth' },
  invoices: [
    { id: 'INV-1', paid: true },
    { id: 'INV-2', paid: false },
  ],
}

describe('JsonViewer', () => {
  it('renders a tree expanded to the default depth', () => {
    renderWithGlyph(<JsonViewer data={data} />)
    const tree = screen.getByRole('tree', { name: 'JSON' })
    expect(within(tree).getByText('"Ledgerline"')).toBeInTheDocument()
    // Depth 2: invoices' items are collapsed.
    expect(within(tree).queryByText('"INV-1"')).not.toBeInTheDocument()
    expect(within(tree).getAllByRole('treeitem')[0]).toHaveAttribute('aria-expanded', 'true')
  })

  it('searches, reveals matches and steps through them', async () => {
    renderWithGlyph(<JsonViewer data={data} />)
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search keys and values' }), 'inv-')
    expect(screen.getByText('1 of 2')).toBeInTheDocument()
    expect((await screen.findAllByText('INV-', { selector: 'mark' })).length).toBeGreaterThan(0)
    await userEvent.click(screen.getByRole('button', { name: 'Next match' }))
    expect(screen.getByText('2 of 2')).toBeInTheDocument()
    expect(screen.getByText('$.invoices[1].id')).toBeInTheDocument()
  })

  it('moves and expands with the keyboard', () => {
    renderWithGlyph(<JsonViewer data={data} defaultExpandDepth={1} />)
    const tree = screen.getByRole('tree')
    fireEvent.keyDown(tree, { key: 'ArrowDown' })
    fireEvent.keyDown(tree, { key: 'ArrowRight' })
    expect(within(tree).getByText('"growth"')).toBeInTheDocument()
    fireEvent.keyDown(tree, { key: 'ArrowLeft' })
    expect(within(tree).queryByText('"growth"')).not.toBeInTheDocument()
    fireEvent.keyDown(tree, { key: 'End' })
    expect(screen.getByText('$.invoices')).toBeInTheDocument()
  })

  it('expands and collapses everything', async () => {
    renderWithGlyph(<JsonViewer data={data} defaultExpandDepth={0} />)
    await userEvent.click(screen.getByRole('button', { name: 'Expand all' }))
    expect(screen.getByText('"INV-2"')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Collapse all' }))
    expect(screen.queryByText('"Ledgerline"')).not.toBeInTheDocument()
  })

  it('copies the selected path', async () => {
    const writeText = vi.fn(async () => {})
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    renderWithGlyph(<JsonViewer data={data} />)
    await userEvent.click(screen.getByText('"growth"'))
    await userEvent.click(screen.getByRole('button', { name: 'Copy path' }))
    expect(writeText).toHaveBeenCalledWith('$.workspace.plan')
    await userEvent.click(screen.getByRole('button', { name: 'Copy value' }))
    expect(writeText).toHaveBeenLastCalledWith('growth')
  })

  it('shows the raw text', async () => {
    renderWithGlyph(<JsonViewer data={{ a: 1 }} />)
    await userEvent.click(screen.getByRole('radio', { name: 'Raw' }))
    expect(screen.getByLabelText('JSON, raw text')).toHaveTextContent('"a": 1')
  })

  it('parses text and points at syntax errors', async () => {
    renderWithGlyph(<JsonViewer content={'{"a": 1,}'} />)
    expect(await screen.findByText("This isn't valid JSON")).toBeInTheDocument()
  })

  it('loads a source', async () => {
    renderWithGlyph(<JsonViewer source={new Blob(['{"loaded": true}'])} />)
    await waitFor(() => expect(screen.getByText('true')).toBeInTheDocument())
  })
})
