import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderWithGlyph } from '../test-utils'
import { SpreadsheetViewer } from './spreadsheet-viewer'

vi.mock('@glyphui/ui/data-table/virtual', async () =>
  (await import('../test-utils')).firstRowsVirtualizer(),
)

const readXlsxFile = vi.fn(async () => [
  {
    sheet: 'Q3 sales',
    data: [
      ['Region', 'Deals', 'Closed', 'Renewal'],
      ['Europe', 4, new Date(Date.UTC(2026, 7, 2)), true],
      ['Asia', 7, new Date(Date.UTC(2026, 8, 3)), false],
    ],
  },
  {
    sheet: 'Targets',
    data: [
      ['Region', 'Target'],
      ['Europe', 250000],
    ],
  },
])
vi.mock('read-excel-file/browser', () => ({
  default: (...args: unknown[]) => readXlsxFile(...(args as [])),
}))

const file = () => new File([new Uint8Array([1, 2, 3])], 'sales.xlsx')

describe('SpreadsheetViewer', () => {
  it('shows each sheet with typed values and switches tabs', async () => {
    renderWithGlyph(<SpreadsheetViewer source={file()} />)
    const table = await screen.findByRole('table', { name: /sheet Q3 sales/ })
    expect(within(table).getByText('Europe')).toBeInTheDocument()
    // Dates follow the reader's locale.
    const day = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeZone: 'UTC' })
    expect(within(table).getByText(day.format(new Date(Date.UTC(2026, 7, 2))))).toBeInTheDocument()
    expect(within(table).getByText('No')).toBeInTheDocument()
    expect(screen.getByText(/2 rows · 4 columns · 2 sheets/)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('tab', { name: 'Targets' }))
    const targets = await screen.findByRole('table', { name: /sheet Targets/ })
    expect(within(targets).getByText((250000).toLocaleString())).toBeInTheDocument()
  })

  it('opens on the sheet asked for', async () => {
    renderWithGlyph(<SpreadsheetViewer source={file()} defaultSheet="Targets" />)
    expect(await screen.findByRole('table', { name: /sheet Targets/ })).toBeInTheDocument()
  })

  it('asks before opening a large workbook', async () => {
    renderWithGlyph(<SpreadsheetViewer source={file()} maxBytes={1} />)
    expect(await screen.findByText('This workbook is large')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Open anyway' }))
    expect(await screen.findByRole('table', { name: /sheet Q3 sales/ })).toBeInTheDocument()
  })

  it('shows read errors', async () => {
    readXlsxFile.mockRejectedValueOnce(new Error('Not a valid .xlsx file.'))
    renderWithGlyph(<SpreadsheetViewer source={file()} />)
    expect(await screen.findByText('Not a valid .xlsx file.')).toBeInTheDocument()
  })
})
