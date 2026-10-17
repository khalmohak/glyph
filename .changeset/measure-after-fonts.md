---
"@glyphui/ui": patch
---

Charts and data tables measure again once web fonts finish loading. A chart's y-axis width and a table's pinned-column offsets were measured with the fallback font when the real one arrived late, so they could stay slightly off (and render differently from one page load to the next).
