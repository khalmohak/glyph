import { Button, toast } from '@glyphui/ui'

function publish() {
  return new Promise<{ version: string }>((resolve) =>
    setTimeout(() => resolve({ version: '0.2.0' }), 1500),
  )
}

export default function Example() {
  return (
    <Button
      onClick={() =>
        toast.promise(publish(), {
          loading: 'Publishing…',
          success: (result) => `Published ${result.version}`,
          error: 'Publishing failed. Try again.',
        })
      }
    >
      Publish release
    </Button>
  )
}
