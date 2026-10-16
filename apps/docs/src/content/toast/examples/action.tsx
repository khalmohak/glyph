import { Button, toast } from '@glyphui/ui'

export default function Example() {
  return (
    <Button
      variant="outline"
      onClick={() =>
        toast('Issue archived', {
          action: { label: 'Undo', onClick: () => toast.success('Issue restored') },
        })
      }
    >
      Archive issue
    </Button>
  )
}
