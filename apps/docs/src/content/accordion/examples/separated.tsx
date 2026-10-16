import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Switch } from '@glyphui/ui'

export default function Example() {
  return (
    <Accordion type="multiple" variant="separated" className="max-w-xl">
      <AccordionItem value="notifications">
        <AccordionTrigger>Notifications</AccordionTrigger>
        <AccordionContent className="flex items-center justify-between gap-4">
          Email me when I'm mentioned
          <Switch defaultChecked aria-label="Email me when I'm mentioned" />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="privacy">
        <AccordionTrigger>Privacy</AccordionTrigger>
        <AccordionContent>
          Your profile is visible to members of your workspace only.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
