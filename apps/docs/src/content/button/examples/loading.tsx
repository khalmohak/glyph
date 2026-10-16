import { Button } from '@glyphui/ui'
import { useState } from 'react'

export default function Example() {
  const [saving, setSaving] = useState(false)
  return (
    <Button
      loading={saving}
      onClick={() => {
        setSaving(true)
        setTimeout(() => setSaving(false), 1500)
      }}
    >
      {saving ? 'Saving…' : 'Save changes'}
    </Button>
  )
}
