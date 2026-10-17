import type { ColumnDef, Table } from '@tanstack/react-table'
import { useState } from 'react'
import { Button } from '../../components/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/dropdown-menu'
import type { ColumnControls } from './column-header'
import { INTERNAL_COLUMNS } from './column-header'
import { columnLabel, downloadText, exportTableCsv, tableRowsToCsv } from './export'
import { DownloadIcon, RotateIcon, SlidersIcon } from './icons'
import type { Density } from './types'

const numberFormat = new Intl.NumberFormat()

export interface TableToolbarMenusProps<T> {
  table: Table<T>
  controls: ColumnControls
  densityToggle: boolean
  density: Density
  onDensityChange: (density: Density) => void
  exportCsv:
    | boolean
    | { fileName?: string; bom?: boolean; fetchAll?: () => Promise<T[]> | T[] }
    | undefined
  // biome-ignore lint/suspicious/noExplicitAny: TanStack's own convention for mixed column value types
  columns: ColumnDef<T, any>[]
  server: boolean
  selectedRows: T[]
}

/** The View menu (columns, density) and the Export menu. */
export function TableToolbarMenus<T>({
  table,
  controls,
  densityToggle,
  density,
  onDensityChange,
  exportCsv,
  columns,
  server,
  selectedRows,
}: TableToolbarMenusProps<T>) {
  const [exporting, setExporting] = useState(false)
  const hideable = controls.hide
    ? table.getAllLeafColumns().filter((c) => c.getCanHide() && !INTERNAL_COLUMNS.has(c.id))
    : []
  const state = table.getState()
  const customized =
    Object.keys(state.columnSizing).length > 0 ||
    state.columnOrder.length > 0 ||
    Boolean(state.columnPinning.left?.length || state.columnPinning.right?.length) ||
    Object.values(state.columnVisibility).some((visible) => !visible)
  const showView = densityToggle || hideable.length > 0

  const options = typeof exportCsv === 'object' ? exportCsv : {}
  const fileName = options.fileName ?? 'export.csv'
  const bom = options.bom ?? true
  const download = (text: string) => downloadText(bom ? `﻿${text}` : text, fileName)
  const pageRows = table.getRowModel().rows
  const allRows = server ? undefined : table.getPrePaginationRowModel().rows
  const selected = table.getSelectedRowModel().rows

  return (
    <>
      {showView && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" leftIcon={<SlidersIcon />}>
              View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-52">
            {densityToggle && (
              <>
                <DropdownMenuLabel>Density</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={density}
                  onValueChange={(value) => onDensityChange(value as Density)}
                >
                  <DropdownMenuRadioItem value="compact">Compact</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="default">Default</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="comfortable">Comfortable</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </>
            )}
            {densityToggle && hideable.length > 0 && <DropdownMenuSeparator />}
            {hideable.length > 0 && (
              <>
                <DropdownMenuLabel>Columns</DropdownMenuLabel>
                {hideable.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    // Keep the menu open to toggle several columns.
                    onSelect={(event) => event.preventDefault()}
                    onCheckedChange={(value) => column.toggleVisibility(value === true)}
                  >
                    {columnLabel(column)}
                  </DropdownMenuCheckboxItem>
                ))}
              </>
            )}
            {customized && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  icon={<RotateIcon />}
                  onSelect={() => {
                    table.resetColumnSizing(true)
                    table.resetColumnOrder(true)
                    table.resetColumnPinning(true)
                    table.resetColumnVisibility(true)
                  }}
                >
                  Reset columns
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {exportCsv && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" leftIcon={<DownloadIcon />} loading={exporting}>
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-56">
            <DropdownMenuLabel>Download as CSV</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => download(tableRowsToCsv(table, pageRows))}>
              This page ({numberFormat.format(pageRows.length)})
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={selected.length === 0 && selectedRows.length === 0}
              onSelect={() => {
                // Server mode keeps rows selected on other pages; export what the table has seen.
                if (server) exportTableCsv({ data: selectedRows, columns, fileName, bom })
                else download(tableRowsToCsv(table, selected))
              }}
            >
              Selected rows ({numberFormat.format(server ? selectedRows.length : selected.length)})
            </DropdownMenuItem>
            {allRows ? (
              <DropdownMenuItem onSelect={() => download(tableRowsToCsv(table, allRows))}>
                All rows ({numberFormat.format(allRows.length)})
              </DropdownMenuItem>
            ) : (
              options.fetchAll && (
                <DropdownMenuItem
                  onSelect={async () => {
                    setExporting(true)
                    try {
                      const data = await options.fetchAll?.()
                      exportTableCsv({ data: data ?? [], columns, fileName, bom })
                    } finally {
                      setExporting(false)
                    }
                  }}
                >
                  All rows
                </DropdownMenuItem>
              )
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  )
}
