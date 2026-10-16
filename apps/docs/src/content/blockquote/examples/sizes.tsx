import { Blockquote } from '@glyphui/ui'

export default function Example() {
  return (
    <div className="grid gap-8">
      <Blockquote size="sm" author="Support ticket #2210">
        The new export saved our finance team a full day each month.
      </Blockquote>
      <Blockquote size="lg" author="Head of Design, Acme">
        We swapped one file and the whole product looked like ours.
      </Blockquote>
    </div>
  )
}
