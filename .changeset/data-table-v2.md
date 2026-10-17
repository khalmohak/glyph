---
"@glyphui/ui": minor
---

DataTable v2: the table SaaS apps need, still a drop-in for the 0.5 API.

- **Server mode.** `mode="server"` with `rowCount` hands paging, sorting, search and filters to your API through `onStateChange`. The current rows stay on screen under a thin progress bar while the next page loads. Cursor APIs pass `hasNextPage`; infinite lists pass `onLoadMore`.
- **Controlled state.** Every slice (page, sort, search, filters, hidden columns, sizes, pinning, order, selection, expanded rows, density) can be controlled through `state` and `onStateChange`, or left to the table. `onSortingChange`, `onPaginationChange`, `onSearchChange` and `onColumnFiltersChange` report single slices.
- **State in the URL.** `useTableUrlState()` keeps the view shareable and the back button working, with any router; one user action is one history entry. With React Router, pass `adapter: useRouterUrlAdapter()` from `@glyphui/ui/react-router`.
- **Filter chips.** Declare `meta.filter` on a column (`select`, `multi` with match counts, `range`, `date-range`, `text`) and the toolbar gets a Filter menu and Linear-style chips. The editors load on first use.
- **Sorting and pages.** Shift-click to sort by several columns, with the order shown in the headers. Page numbers, first and last, and a rows-per-page menu.
- **Selection.** "Select all 312" selects every matching row across pages (`allMatchingSelected` in server mode), and `bulkActions` shows your actions in a floating bar.
- **Columns.** `columnControls` adds hiding (a View menu and a menu on each column), drag and keyboard resizing, pinning with sticky columns, and drag or keyboard reordering. `densityToggle` adds compact, default and comfortable; themes can set the default density.
- **Rows.** `onRowClick` and `getRowHref` (a real link, so keyboard and middle-click work) without stealing clicks from buttons or checkboxes inside; `renderSubRow` for expandable details.
- **Inline editing.** `editableCell()` edits text, numbers or choices in place. `onCellEdit` saves; the cell shows the new value at once and rolls back if saving fails.
- **CSV export.** `exportCsv` adds an Export menu (this page, selected rows, all rows); `exportTableCsv()` and `toCsv()` export without a table. Quoting follows RFC 4180, and text that looks like a formula is neutralized.
- **Phones and big data.** `mobile="cards"` shows rows as cards below 640px. `virtualRows()` from the new `@glyphui/ui/data-table/virtual` renders only visible rows for 10,000+ (needs `@tanstack/react-virtual`).
- **Fixes.** When `data` changes, selections of rows that still exist are kept (with `getRowId`) and the page stays in range.
