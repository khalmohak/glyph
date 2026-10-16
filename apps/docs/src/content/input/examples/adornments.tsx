import { Input, Kbd } from '@glyphui/ui'
import { Globe, Search } from 'lucide-react'

export default function Example() {
  return (
    <div className="grid max-w-sm gap-3">
      <Input aria-label="Workspace URL" prefix="glyph.app/" defaultValue="acme" />
      <Input aria-label="Domain" prefix={<Globe />} placeholder="acme.dev" />
      <Input aria-label="Search" prefix={<Search />} placeholder="Search" suffix={<Kbd>/</Kbd>} />
      <Input aria-label="Price" type="number" defaultValue="24" suffix="USD / month" />
    </div>
  )
}
