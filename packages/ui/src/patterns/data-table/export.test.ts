import { describe, expect, it, vi } from 'vitest'
import { exportTableCsv, toCsv } from './export'
import { createColumnHelper } from './index'

describe('toCsv', () => {
  it('quotes fields with delimiters, quotes, line breaks and edge spaces', () => {
    expect(
      toCsv([
        ['plain', 'a,b', 'say "hi"', 'two\nlines', ' padded'],
        [1, true, null, undefined, new Date('2026-01-02T03:04:05Z')],
      ]),
    ).toBe('plain,"a,b","say ""hi""","two\nlines"," padded"\r\n1,true,,,2026-01-02T03:04:05.000Z')
  })

  it('neutralizes formulas in text but leaves numbers alone', () => {
    expect(toCsv([['=SUM(A1)', '+1', '-x', '@cmd', -5]])).toBe("'=SUM(A1),'+1,'-x,'@cmd,-5")
    expect(toCsv([['=SUM(A1)']], { escapeFormulas: false })).toBe('=SUM(A1)')
  })

  it('supports other delimiters and joins arrays', () => {
    expect(toCsv([['a;b', ['x', 'y']]], { delimiter: ';', newline: '\n' })).toBe('"a;b";x, y')
  })
})

describe('exportTableCsv', () => {
  interface Invoice {
    id: string
    customer: { name: string }
    total: number
    note: string
  }
  const col = createColumnHelper<Invoice>()
  const columns = [
    col.accessor('id', { header: 'Invoice' }),
    col.accessor((row) => row.customer.name, { id: 'customer', meta: { label: 'Customer' } }),
    col.accessor('total', { header: 'Total', meta: { csv: (value) => (value / 100).toFixed(2) } }),
    col.accessor('note', { header: 'Note', meta: { csv: false } }),
    col.display({ id: 'actions', header: 'Actions' }),
  ]
  const data: Invoice[] = [
    { id: 'INV-1', customer: { name: 'Acme, Inc.' }, total: 12345, note: 'secret' },
  ]

  it('builds CSV from column definitions, skipping display and csv:false columns', () => {
    const text = exportTableCsv({ data, columns, download: false })
    expect(text).toBe('Invoice,Customer,Total\r\nINV-1,"Acme, Inc.",123.45')
  })

  it('downloads a file with a byte-order mark', () => {
    const created: Blob[] = []
    const createObjectURL = vi.fn((blob: Blob) => {
      created.push(blob)
      return 'blob:x'
    })
    Object.assign(URL, { createObjectURL, revokeObjectURL: vi.fn() })
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    exportTableCsv({ data, columns, fileName: 'invoices.csv' })
    expect(click).toHaveBeenCalled()
    const text = exportTableCsv({ data, columns, download: false })
    // The UTF-8 byte-order mark adds three bytes in front of the text.
    expect(created[0]!.size).toBe(new TextEncoder().encode(text).length + 3)
    expect(created[0]!.type).toBe('text/csv;charset=utf-8')
    click.mockRestore()
  })
})

describe('CSV injection in list cells', () => {
  it('escapes a formula at the start of a joined list, like a tags column', () => {
    expect(toCsv([[['=HYPERLINK("http://x")', 'vip']]])).toBe('"\'=HYPERLINK(""http://x""), vip"')
  })
})
