import { Button, toast } from '@glyphui/ui'

export default function Example() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => toast('Draft saved')}>
        Default
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.success('Invoice sent', { description: 'Acme Inc. will get it by email.' })
        }
      >
        Success
      </Button>
      <Button variant="outline" onClick={() => toast.info('Sync runs every 15 minutes')}>
        Info
      </Button>
      <Button variant="outline" onClick={() => toast.warning('Your trial ends in 3 days')}>
        Warning
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.error('Couldn’t upload logo.png', { description: 'Files must be under 2 MB.' })
        }
      >
        Error
      </Button>
    </div>
  )
}
