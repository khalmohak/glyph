import { Newsletter } from '@glyphui/blocks'

export default function Example() {
  return (
    <Newsletter
      layout="split"
      title="Get the changelog"
      description="Release notes for every version, straight to your inbox."
      buttonLabel="Notify me"
      onSubscribe={() => new Promise((resolve) => setTimeout(resolve, 600))}
    />
  )
}
