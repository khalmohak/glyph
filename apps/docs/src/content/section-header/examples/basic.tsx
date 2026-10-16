import { SectionHeader } from '@glyphui/blocks'

export default function Example() {
  return (
    <div className="grid w-full gap-12">
      <SectionHeader
        eyebrow="Integrations"
        title="Works with the tools you already use"
        description="Accounting, CRM and data warehouse connectors, maintained by us."
      />
      <SectionHeader align="center" eyebrow="Security" title="Built for audits" headingLevel={3} />
    </div>
  )
}
