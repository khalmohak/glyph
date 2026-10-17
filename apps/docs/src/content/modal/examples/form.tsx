import { Button, Field, Input, Modal, Textarea, toast } from '@glyphui/ui'
import { useState } from 'react'

export default function Example() {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      closeOnOverlayClick={false}
      title="New project"
      description="You can change these details later."
      trigger={<Button>New project</Button>}
      onSubmit={async () => {
        setSaving(true)
        await new Promise((resolve) => setTimeout(resolve, 800))
        setSaving(false)
        setOpen(false)
        toast.success('Project created')
      }}
      footer={
        <Button type="submit" loading={saving}>
          Create project
        </Button>
      }
    >
      <Field label="Name" required>
        <Input name="name" placeholder="Website redesign" required />
      </Field>
      <Field label="Description">
        <Textarea name="description" placeholder="What is this project about?" />
      </Field>
    </Modal>
  )
}
