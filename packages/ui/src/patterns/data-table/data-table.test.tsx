import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { createColumnHelper, DataTable } from './index'

interface Person {
  id: string
  name: string
  age: number
}

const col = createColumnHelper<Person>()
const columns = [
  col.accessor('name', { header: 'Name' }),
  col.accessor('age', { header: 'Age', meta: { align: 'right' } }),
]
const people: Person[] = [
  { id: '1', name: 'Ada', age: 36 },
  { id: '2', name: 'Grace', age: 85 },
  { id: '3', name: 'Linus', age: 54 },
]

const bodyRows = () => within(screen.getAllByRole('rowgroup')[1]!).getAllByRole('row')

describe('DataTable', () => {
  it('sorts when a header is clicked', async () => {
    render(<DataTable data={people} columns={columns} />)
    await userEvent.click(screen.getByRole('button', { name: /Age/ }))
    expect(bodyRows()[0]).toHaveTextContent('Ada')
    await userEvent.click(screen.getByRole('button', { name: /Age/ }))
    expect(bodyRows()[0]).toHaveTextContent('Grace')
  })

  it('filters with search and offers to clear an empty result', async () => {
    render(<DataTable data={people} columns={columns} search />)
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search rows' }), 'zzz')
    expect(screen.getByText('No results for “zzz”')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Clear search' }))
    expect(bodyRows()).toHaveLength(3)
  })

  it('renders loading, empty and error states', () => {
    const { rerender } = render(
      <DataTable data={undefined} columns={columns} loading aria-label="People" />,
    )
    expect(screen.getByRole('table', { name: 'People' })).toHaveAttribute('aria-busy', 'true')

    rerender(<DataTable data={[]} columns={columns} />)
    expect(screen.getByText('No rows yet')).toBeInTheDocument()

    const onRetry = vi.fn()
    rerender(
      <DataTable data={[]} columns={columns} error={new Error('Timed out')} onRetry={onRetry} />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Timed out')
  })

  it('reports selected rows', async () => {
    const onSelectionChange = vi.fn()
    render(
      <DataTable
        data={people}
        columns={columns}
        selectable
        getRowId={(p) => p.id}
        onSelectionChange={onSelectionChange}
      />,
    )
    await userEvent.click(screen.getAllByRole('checkbox', { name: 'Select row' })[1]!)
    expect(onSelectionChange).toHaveBeenLastCalledWith([people[1]])
  })
})
