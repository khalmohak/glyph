---
"@glyphui/viewers": patch
---

PdfViewer sets `aria-busy` while a document loads, so screen readers know it isn't ready yet (its toolbar is disabled meanwhile).
