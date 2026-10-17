import {
  Badge,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Field,
  Input,
  type PresetName,
  presets,
  Switch,
  ThemeScope,
} from '@glyphui/ui'
import { presetLabel, presetNames } from '../../shell/theme-controls'

/** The same card under each preset: the theme file is the only difference. */
export function ThemeTeaser() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {presetNames.map((name) => (
        <figure key={name} className="grid gap-2">
          <ThemeScope
            theme={presets[name]}
            className="rounded-xl border-(length:--glyph-border-width) border-border bg-subtle p-4"
          >
            <SampleCard name={name} />
          </ThemeScope>
          <figcaption className="font-mono text-caption text-muted-foreground">
            presets.{name}
          </figcaption>
        </figure>
      ))}
    </div>
  )
}

function SampleCard({ name }: { name: PresetName }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Team plan</CardTitle>
          <Badge tone="primary">{presetLabel(name)}</Badge>
        </div>
        <CardDescription>Invite people and share projects.</CardDescription>
      </CardHeader>
      <CardBody className="grid gap-3">
        <Field label="Email">
          <Input placeholder="you@team.com" />
        </Field>
        <Field orientation="horizontal" label="Weekly digest">
          <Switch defaultChecked />
        </Field>
      </CardBody>
      <CardFooter className="justify-end gap-2">
        <Button variant="ghost" size="sm">
          Later
        </Button>
        <Button size="sm">Invite</Button>
      </CardFooter>
    </Card>
  )
}
