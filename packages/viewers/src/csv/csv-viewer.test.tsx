import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderWithGlyph } from '../test-utils'
import { CsvViewer } from './csv-viewer'

vi.mock('@glyphui/ui/data-table/virtual', async () =>
  (await import('../test-utils')).firstRowsVirtualizer(),
)

const csv = `id,company,mrr,active,signed_up
1001,Northwind,1240,true,2026-01-04
1002,Globex,8200,false,2026-02-11
1003,Initech,0,true,2026-03-20`

describe('CsvViewer', () => {
  it('renders typed rows with a summary', async () => {
    const onParsed = vi.fn()
    renderWithGlyph(<CsvViewer content={csv} fileName="customers.csv" onParsed={onParsed} />)
    const table = await screen.findByRole('table', { name: 'customers.csv' })
    expect(within(table).getByRole('columnheader', { name: /company/ })).toBeInTheDocument()
    expect(within(table).getByText('Globex')).toBeInTheDocument()
    // ids keep their digits; amounts are grouped.
    expect(within(table).getByText('1001')).toBeInTheDocument()
    expect(within(table).getByText((8200).toLocaleString())).toBeInTheDocument()
    expect(within(table).getAllByText('Yes')).toHaveLength(2)
    expect(screen.getByText(/3 rows · 5 columns · comma-separated/)).toBeInTheDocument()
    expect(onParsed).toHaveBeenCalledWith(expect.objectContaining({ delimiter: ',' }))
  })

  it('turns the header row off', async () => {
    renderWithGlyph(<CsvViewer content={csv} />)
    await screen.findByRole('table')
    await userEvent.click(screen.getByRole('switch', { name: 'Header row' }))
    expect(await screen.findByText(/4 rows/)).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /^A/ })).toBeInTheDocument()
  })

  it('reads a File and reports rows it could not parse cleanly', async () => {
    const file = new File(['a,b\n1,"open\n2,3'], 'broken.csv', { type: 'text/csv' })
    renderWithGlyph(<CsvViewer source={file} />)
    expect(await screen.findByText(/could not be read cleanly/)).toBeInTheDocument()
  })

  it('loads URLs and shows an error state when the request fails', async () => {
    const fetchMock = vi.fn(async () => new Response('nope', { status: 404 }))
    vi.stubGlobal('fetch', fetchMock)
    renderWithGlyph(<CsvViewer source="https://example.com/missing.csv" />)
    expect(await screen.findByText(/HTTP 404/)).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalled()
    vi.unstubAllGlobals()
  })

  it('asks for a source', async () => {
    renderWithGlyph(<CsvViewer />)
    expect(await screen.findByText(/No CSV to show/)).toBeInTheDocument()
  })

  it('switches the delimiter', async () => {
    renderWithGlyph(<CsvViewer content={'a;b\n1;2'} />)
    await waitFor(() => expect(screen.getByText(/semicolon-separated/)).toBeInTheDocument())
    expect(screen.getByRole('combobox', { name: 'Delimiter' })).toHaveTextContent(
      'Auto (Semicolon)',
    )
  })
})
