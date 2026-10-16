import { Field, TagInput } from '@glyphui/ui'
import { useState } from 'react'

export default function Example() {
  const [tags, setTags] = useState(['design-system', 'react'])
  return (
    <Field label="Keywords" description="Press Enter or comma to add." className="w-full max-w-md">
      <TagInput value={tags} onValueChange={setTags} placeholder="Add a keyword…" />
    </Field>
  )
}
