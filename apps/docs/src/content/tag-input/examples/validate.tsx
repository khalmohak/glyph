import { Field, TagInput } from '@glyphui/ui'

const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Example() {
  return (
    <Field
      label="Invite teammates"
      description="Up to 5 email addresses."
      className="w-full max-w-md"
    >
      <TagInput
        placeholder="name@company.com"
        maxTags={5}
        validate={(tag) => (email.test(tag) ? true : `“${tag}” isn't a valid email address.`)}
      />
    </Field>
  )
}
