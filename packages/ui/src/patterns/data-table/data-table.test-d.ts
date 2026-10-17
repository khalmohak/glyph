import { describe, expectTypeOf, it } from 'vitest'
import {
  type ColumnFilterConfig,
  createColumnHelper,
  type DataTableProps,
  type DataTableState,
  editableCell,
  type TableSelection,
  useTableUrlState,
} from './index'

interface Invoice {
  id: string
  status: 'paid' | 'open'
  total: number
}

const col = createColumnHelper<Invoice>()

describe('DataTable types', () => {
  it('types column filter configs', () => {
    col.accessor('status', {
      meta: { filter: { type: 'multi', options: [{ value: 'paid', label: 'Paid' }] } },
    })
    col.accessor('total', { meta: { filter: { type: 'range', format: (n) => `$${n}` } } })
    // @ts-expect-error options are required for select filters
    col.accessor('status', { meta: { filter: { type: 'select' } } })
    // @ts-expect-error unknown filter type
    col.accessor('status', { meta: { filter: { type: 'between' } } })
    expectTypeOf<ColumnFilterConfig['type']>().toEqualTypeOf<
      'select' | 'multi' | 'range' | 'date-range' | 'text'
    >()
  })

  it('types the csv hook from the column value', () => {
    col.accessor('total', {
      meta: {
        csv: (value, row) => {
          expectTypeOf(value).toEqualTypeOf<number>()
          expectTypeOf(row).toEqualTypeOf<Invoice>()
          return value
        },
      },
    })
  })

  it('types state slices and callbacks', () => {
    expectTypeOf<DataTableState['density']>().toEqualTypeOf<'compact' | 'default' | 'comfortable'>()
    expectTypeOf<NonNullable<DataTableProps<Invoice>['onStateChange']>>()
      .parameter(1)
      .toEqualTypeOf<keyof DataTableState>()
    expectTypeOf<NonNullable<DataTableProps<Invoice>['bulkActions']>>()
      .parameter(0)
      .toEqualTypeOf<TableSelection<Invoice>>()
    // @ts-expect-error not a density
    const state: Partial<DataTableState> = { density: 'tight' }
    void state
  })

  it('spreads URL state onto DataTable', () => {
    const url = (() => useTableUrlState()) as unknown as () => ReturnType<typeof useTableUrlState>
    expectTypeOf(url().state).toMatchTypeOf<DataTableProps<Invoice>['state']>()
    expectTypeOf(url().onStateChange).toMatchTypeOf<
      NonNullable<DataTableProps<Invoice>['onStateChange']>
    >()
  })

  it('types editable cells by row and value', () => {
    col.accessor('total', {
      cell: editableCell<Invoice, number>({
        type: 'number',
        validate: (value, row) => {
          expectTypeOf(value).toEqualTypeOf<number>()
          expectTypeOf(row).toEqualTypeOf<Invoice>()
          return value < 0 ? 'Must be positive' : null
        },
      }),
    })
  })
})
