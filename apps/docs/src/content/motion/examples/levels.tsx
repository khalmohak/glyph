import {
  AnimatedNumber,
  Card,
  Checkbox,
  defineTheme,
  type MotionLevel,
  SegmentedControl,
  Stagger,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
  ThemeScope,
  useGlyph,
} from '@glyphui/ui'
import { useMemo, useState } from 'react'

export default function Example() {
  const { theme } = useGlyph()
  const [level, setLevel] = useState<MotionLevel>('subtle')
  const [replay, setReplay] = useState(0)
  const [seats, setSeats] = useState(12)
  const scoped = useMemo(
    () => defineTheme({ name: `${theme.name}-motion-${level}`, extends: theme, motion: { level } }),
    [theme, level],
  )

  return (
    <div className="grid w-full gap-4">
      <SegmentedControl<MotionLevel>
        aria-label="Motion level"
        className="justify-self-start"
        value={level}
        onValueChange={(next) => {
          setLevel(next)
          setReplay((n) => n + 1)
        }}
        options={[
          { value: 'none', label: 'None' },
          { value: 'subtle', label: 'Subtle' },
          { value: 'expressive', label: 'Expressive' },
        ]}
      />
      <ThemeScope theme={scoped} className="grid gap-5 rounded-lg p-5">
        <div className="flex flex-wrap items-center gap-6">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="sr-only">
              Overview
            </TabsContent>
            <TabsContent value="activity" className="sr-only">
              Activity
            </TabsContent>
            <TabsContent value="settings" className="sr-only">
              Settings
            </TabsContent>
          </Tabs>
          <SegmentedControl
            aria-label="View"
            size="sm"
            defaultValue="list"
            options={[
              { value: 'list', label: 'List' },
              { value: 'board', label: 'Board' },
              { value: 'timeline', label: 'Timeline' },
            ]}
          />
          <Switch aria-label="Notifications" defaultChecked />
          <Checkbox aria-label="Done" />
        </div>
        <Stagger key={replay} className="grid gap-3 sm:grid-cols-3">
          {['Revenue', 'Seats', 'Uptime'].map((label, i) => (
            <Card key={label} padding="sm">
              <Text size="small" tone="muted">
                {label}
              </Text>
              <p className="font-display text-h3">
                {i === 1 ? (
                  <button
                    type="button"
                    className="cursor-pointer"
                    onClick={() => setSeats((n) => n + 7)}
                  >
                    <AnimatedNumber value={seats} />
                  </button>
                ) : i === 0 ? (
                  '$48k'
                ) : (
                  '99.98%'
                )}
              </p>
            </Card>
          ))}
        </Stagger>
      </ThemeScope>
    </div>
  )
}
