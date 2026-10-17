import {
  Button,
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  type ColorModePreference,
  Field,
  FileUpload,
  Input,
  PageHeader,
  PasswordInput,
  SegmentedControl,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  toast,
  useColorMode,
} from '@glyphui/ui'
import { Form, FormField, FormSubmit, useForm } from '@glyphui/ui/form'
import { z } from 'zod'

const profileSchema = z.object({
  company: z.string().trim().min(2, 'Use at least 2 characters'),
  billingEmail: z.email('Enter a valid email address'),
  address: z.string().max(200),
})

export function SettingsPage() {
  const { mode, setMode } = useColorMode()
  const form = useForm({
    schema: profileSchema,
    defaultValues: {
      company: 'Ledgerline, Inc.',
      billingEmail: 'billing@ledgerline.app',
      address: '',
    },
  })

  return (
    <>
      <PageHeader title="Settings" description="Workspace profile, appearance and security." />
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Company profile</CardTitle>
              <CardDescription>Appears on every invoice you send.</CardDescription>
            </CardHeader>
            <Form
              form={form}
              onSubmit={async () => {
                await new Promise((resolve) => setTimeout(resolve, 500))
                toast.success('Profile saved')
              }}
            >
              <CardBody className="grid gap-4">
                <FormField control={form.control} name="company" label="Company name" required>
                  {(field) => <Input {...field} />}
                </FormField>
                <FormField
                  control={form.control}
                  name="billingEmail"
                  label="Billing email"
                  required
                >
                  {(field) => <Input type="email" {...field} />}
                </FormField>
                <FormField control={form.control} name="address" label="Address">
                  {(field) => <Textarea rows={3} {...field} />}
                </FormField>
                <Field label="Logo" description="PNG or SVG, up to 2 MB.">
                  <FileUpload
                    accept="image/png,image/svg+xml"
                    maxSize={2 * 1024 * 1024}
                    maxFiles={1}
                  />
                </Field>
              </CardBody>
              <CardFooter className="justify-end">
                <FormSubmit>Save changes</FormSubmit>
              </CardFooter>
            </Form>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Choose how Ledgerline looks on this device.</CardDescription>
            </CardHeader>
            <CardBody className="grid gap-4">
              <Field label="Color mode">
                <SegmentedControl<ColorModePreference>
                  aria-label="Color mode"
                  value={mode}
                  onValueChange={setMode}
                  options={[
                    { value: 'light', label: 'Light' },
                    { value: 'dark', label: 'Dark' },
                    { value: 'system', label: 'System' },
                  ]}
                />
              </Field>
              <Field
                orientation="horizontal"
                label="Compact tables"
                description="Shows more rows per page."
              >
                <Switch />
              </Field>
            </CardBody>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
            </CardHeader>
            <CardBody className="grid max-w-sm gap-4">
              <Field label="Current password">
                <PasswordInput autoComplete="current-password" />
              </Field>
              <Field label="New password">
                <PasswordInput autoComplete="new-password" showStrength />
              </Field>
            </CardBody>
            <CardFooter className="justify-end">
              <Button onClick={() => toast.success('Password updated')}>Update password</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
