import { Text, useControllableState, useMediaQuery } from '@glyphui/ui'

export default function Example() {
  const wide = useMediaQuery('(min-width: 48rem)')
  const [count, setCount] = useControllableState({ defaultValue: 0 })
  return (
    <div className="grid gap-2">
      <Text size="small">Viewport is {wide ? 'wide' : 'narrow'} (useMediaQuery).</Text>
      <button
        type="button"
        className="justify-self-start rounded-md border border-border px-3 py-1.5 text-small"
        onClick={() => setCount((c) => c + 1)}
      >
        Clicked {count} times (useControllableState)
      </button>
    </div>
  )
}
