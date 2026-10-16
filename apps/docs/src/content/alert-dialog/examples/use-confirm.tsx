import { Button, ConfirmProvider, toast, useConfirm } from '@glyphui/ui'

function DeleteProjectButton() {
  const confirm = useConfirm()

  async function handleDelete() {
    const confirmed = await confirm({
      title: 'Delete “Website redesign”?',
      description: 'Its 48 issues and all comments are deleted. This can’t be undone.',
      tone: 'danger',
    })
    if (confirmed) toast.success('Project deleted')
  }

  return (
    <Button variant="danger" onClick={handleDelete}>
      Delete project
    </Button>
  )
}

// Mount ConfirmProvider once at the root of your app.
export default function Example() {
  return (
    <ConfirmProvider>
      <DeleteProjectButton />
    </ConfirmProvider>
  )
}
