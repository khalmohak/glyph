import { Tabs, TabsContent, TabsList, TabsTrigger, Text } from '@glyphui/ui'

export default function Example() {
  return (
    <Tabs defaultValue="monthly" variant="pill">
      <TabsList>
        <TabsTrigger value="monthly">Monthly</TabsTrigger>
        <TabsTrigger value="yearly">Yearly</TabsTrigger>
      </TabsList>
      <TabsContent value="monthly">
        <Text>$20 per seat, billed monthly.</Text>
      </TabsContent>
      <TabsContent value="yearly">
        <Text>$16 per seat, billed yearly.</Text>
      </TabsContent>
    </Tabs>
  )
}
