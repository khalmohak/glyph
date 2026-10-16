import { Cta } from '@glyphui/blocks'
import { Button } from '@glyphui/ui'

export default function Example() {
  return (
    <Cta variant="band" title="Ready when you are" actions={<Button>Create an account</Button>} />
  )
}
