import { FileUpload } from '@glyphui/ui'

export default function Example() {
  return (
    <FileUpload
      className="w-full max-w-md"
      accept="image/png,image/jpeg,.webp"
      maxSize={5 * 1024 * 1024}
      maxFiles={4}
    />
  )
}
