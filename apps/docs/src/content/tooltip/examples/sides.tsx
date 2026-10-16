import { Button, Tooltip } from '@glyphui/ui'

export default function Example() {
  return (
    <div className="flex flex-wrap gap-2">
      {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
        <Tooltip key={side} content={`Shown on the ${side}`} side={side}>
          <Button variant="outline" size="sm">
            {side}
          </Button>
        </Tooltip>
      ))}
    </div>
  )
}
