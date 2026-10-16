import { Card, Skeleton } from '@glyphui/ui'

export default function Example() {
  return (
    <Card className="max-w-sm" aria-busy="true">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-pill" />
        <div className="grid flex-1 gap-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <Skeleton className="h-24 w-full" />
    </Card>
  )
}
