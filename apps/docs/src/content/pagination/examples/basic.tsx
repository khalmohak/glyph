import { Pagination, Text } from '@glyphui/ui'
import { useState } from 'react'

export default function Example() {
  const [page, setPage] = useState(6)
  return (
    <div className="grid justify-items-start gap-3">
      <Pagination page={page} pageCount={20} onPageChange={setPage} />
      <Text size="small" tone="muted">
        Page {page} of 20
      </Text>
    </div>
  )
}
