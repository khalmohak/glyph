import { AspectRatio, Text } from '@glyphui/ui'

export default function Example() {
  return (
    <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
      {[
        { ratio: 16 / 9, label: '16 : 9' },
        { ratio: 1, label: '1 : 1' },
      ].map(({ ratio, label }) => (
        <div key={label} className="grid gap-2">
          <AspectRatio ratio={ratio} rounded placeholder>
            <div className="flex size-full items-center justify-center bg-gradient-to-br from-primary/25 to-transparent">
              <span className="font-display text-h3">{label}</span>
            </div>
          </AspectRatio>
          <Text size="small" tone="muted">
            ratio={'{'}
            {label.replace(' : ', ' / ')}
            {'}'}
          </Text>
        </div>
      ))}
    </div>
  )
}
