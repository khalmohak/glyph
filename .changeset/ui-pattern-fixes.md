---
"@glyphui/ui": patch
---

Bug fixes for tables, charts, layout, motion and router integration.

- **DataTable:**
  - In server mode, "Select all 312" now survives moving to another page.
  - When the server total shrinks below the current page (say, after deleting every row on the last page), the table moves back to the last page instead of showing an empty one.
  - Sorting or filters for a column that no longer exists (an old shared URL, say) are ignored instead of logging errors on every render.
  - CSV export now escapes a formula at the start of a list cell, like a tags column.
- **Table URL state:** a search still being typed no longer overwrites the page the user navigated to with the back or forward button.
- **Charts:**
  - Gaps in data (`null` or missing values) show as "—" in the accessible data table instead of `0` or `NaN`.
  - Legends ignore hidden keys for series, slices or groups that have gone away, and never leave a chart with everything hidden.
  - Heatmap skips invalid dates instead of drawing an empty grid.
- **AppShell and Navbar:**
  - The mobile drawer and menu panel close when the window grows to desktop width.
  - Using an action in the Navbar's mobile panel closes it.
  - Links that share an `href` no longer trigger React key warnings.
- **`useAsync`:** a function that throws before returning a promise now produces an error state instead of crashing.
- **Motion:**
  - `PageTransition` no longer replays its entrance when the first page re-renders.
  - `AnimatedNumber` shows `NaN` or `Infinity` values directly instead of animating them.
- **React Router:**
  - Relative `href`s (like `"invoices"` under `/app`) are marked active.
  - Table URL writes through `useRouterUrlAdapter()` keep the location hash.
