import { Tabs, TabsContent, TabsList, TabsTrigger, Text } from '@glyphui/ui'

export default function Example() {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <Text tone="muted">12 open issues, 3 due this week.</Text>
      </TabsContent>
      <TabsContent value="activity">
        <Text tone="muted">Grace closed GLY-131 two hours ago.</Text>
      </TabsContent>
      <TabsContent value="settings">
        <Text tone="muted">Only admins can change project settings.</Text>
      </TabsContent>
    </Tabs>
  )
}
