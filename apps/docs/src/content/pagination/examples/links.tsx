import { Pagination } from '@glyphui/ui'

export default function Example() {
  return (
    <Pagination
      page={3}
      pageCount={8}
      size="sm"
      showEdges={false}
      getHref={(page) => `?page=${page}`}
    />
  )
}
