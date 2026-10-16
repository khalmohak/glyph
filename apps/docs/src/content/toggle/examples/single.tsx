import { Text, Toggle } from '@glyphui/ui'
import { Star } from 'lucide-react'
import { useState } from 'react'

export default function Example() {
  const [starred, setStarred] = useState(false)
  return (
    <div className="flex items-center gap-3">
      <Toggle
        variant="outline"
        pressed={starred}
        onPressedChange={setStarred}
        aria-label="Star repository"
      >
        <Star className={starred ? 'fill-current text-warning' : undefined} />
        {starred ? 'Starred' : 'Star'}
      </Toggle>
      <Text size="small" tone="muted">
        {starred ? '1,205' : '1,204'} stars
      </Text>
    </div>
  )
}
