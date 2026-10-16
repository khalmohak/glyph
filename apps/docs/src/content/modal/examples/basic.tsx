import { Button, Field, Input, Modal, ModalClose } from '@glyphui/ui'
import { UserPlus } from 'lucide-react'

export default function Example() {
  return (
    <Modal
      title="Invite teammates"
      description="They get access to every project in Acme Inc."
      trigger={<Button leftIcon={<UserPlus />}>Invite</Button>}
      footer={
        <>
          <ModalClose asChild>
            <Button variant="outline">Cancel</Button>
          </ModalClose>
          <ModalClose asChild>
            <Button>Send invites</Button>
          </ModalClose>
        </>
      }
    >
      <Field label="Email addresses" description="Separate addresses with commas.">
        <Input placeholder="grace@acme.com, alan@acme.com" />
      </Field>
    </Modal>
  )
}
