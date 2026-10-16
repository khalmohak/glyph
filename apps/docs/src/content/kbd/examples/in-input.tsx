import { Input, Kbd } from '@glyphui/ui'
import { Search } from 'lucide-react'

export default function Example() {
  return (
    <Input
      aria-label="Search docs"
      placeholder="Search docs"
      prefix={<Search />}
      suffix={<Kbd>/</Kbd>}
      className="max-w-xs"
    />
  )
}
