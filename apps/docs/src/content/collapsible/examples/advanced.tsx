import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Field,
  Input,
  Switch,
} from '@glyphui/ui'
import { ChevronDown } from 'lucide-react'

export default function Example() {
  return (
    <Collapsible className="grid w-full max-w-sm gap-3">
      <Field label="Webhook URL">
        <Input defaultValue="https://api.acme.com/hooks/glyph" />
      </Field>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="group justify-self-start"
          rightIcon={
            <ChevronDown className="transition-transform group-data-[state=open]:rotate-180" />
          }
        >
          Advanced options
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="grid gap-4 pt-1">
          <Field label="Signing secret" description="Used to verify that requests come from Glyph.">
            <Input type="password" defaultValue="whsec_7f3a91" />
          </Field>
          <Field
            orientation="horizontal"
            label="Retry failed deliveries"
            description="Up to 5 times over 24 hours."
          >
            <Switch defaultChecked />
          </Field>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
