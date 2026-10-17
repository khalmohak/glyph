import { Field, Textarea } from '@glyphui/ui'
import { CsvViewer } from '@glyphui/viewers/csv'
import { useState } from 'react'

const sample = `country;capital;population_millions;eu_member
France;Paris;68.4;true
Germany;Berlin;84.5;true
Norway;Oslo;5.5;false
Spain;Madrid;48.6;true
Switzerland;Bern;8.9;false`

export default function Example() {
  const [text, setText] = useState(sample)
  return (
    <div className="grid w-full gap-4">
      <Field label="Paste CSV">
        <Textarea
          rows={4}
          value={text}
          onChange={(event) => setText(event.target.value)}
          className="font-mono"
        />
      </Field>
      <CsvViewer content={text} fileName="countries.csv" height={280} />
    </div>
  )
}
