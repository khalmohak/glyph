import { Button } from '@glyphui/ui'
import { ArrowUpRight } from 'lucide-react'

export default function Example() {
  return (
    <Button variant="outline" rightIcon={<ArrowUpRight />} asChild>
      <a href="https://github.com/khalmohak/glyph">View on GitHub</a>
    </Button>
  )
}
