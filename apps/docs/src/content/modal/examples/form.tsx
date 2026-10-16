import { Button, Field, Input, Modal, Textarea, toast } from '@glyphui/ui'
import { type FormEvent, useState } from 'react'

export default function Example() {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setSaving(false)
    setOpen(false)
    toast.success('Project created')
  }

  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      closeOnOverlayClick={false}
      title="New project"
      description="You can change these details later."
      trigger={<Button>New project</Button>}
      footer={
        <Button type="submit" form="new-project" loading={saving}>
          Create project
        </Button>
      }
    >
      <form id="new-project" onSubmit={save} className="grid gap-4">
        <Field label="Name" required>
          <Input name="name" placeholder="Website redesign" required />
        </Field>
        <Field label="Description">
          <Textarea name="description" placeholder="What is this project about?" />
        </Field>
      </form>
    </Modal>
  )
}
