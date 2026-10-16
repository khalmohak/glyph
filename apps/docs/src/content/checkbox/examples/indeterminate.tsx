import { Checkbox, Label } from '@glyphui/ui'
import { useState } from 'react'

const channels = ['Email', 'Slack', 'SMS'] as const

export default function Example() {
  const [checked, setChecked] = useState<string[]>(['Email'])
  const all = checked.length === channels.length
  const some = checked.length > 0 && !all
  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        <Checkbox
          id="all-channels"
          checked={all ? true : some ? 'indeterminate' : false}
          onCheckedChange={(value) => setChecked(value === true ? [...channels] : [])}
        />
        <Label htmlFor="all-channels">All channels</Label>
      </div>
      {channels.map((channel) => (
        <div key={channel} className="flex items-center gap-2 pl-6">
          <Checkbox
            id={`channel-${channel}`}
            checked={checked.includes(channel)}
            onCheckedChange={(value) =>
              setChecked((prev) =>
                value === true ? [...prev, channel] : prev.filter((c) => c !== channel),
              )
            }
          />
          <Label htmlFor={`channel-${channel}`}>{channel}</Label>
        </div>
      ))}
    </div>
  )
}
