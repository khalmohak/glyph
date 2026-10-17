import {
  Button,
  Field,
  Input,
  NumberInput,
  type PresetName,
  presets,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  SegmentedControl,
  Select,
  SelectItem,
  Switch,
  Text,
  ThemeScope,
} from '@glyphui/ui'
import { CodeViewer } from '@glyphui/viewers/code'
import { RotateCcw } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { ErrorBoundary } from '../components/error-boundary'
import { type Control, fromParam, jsxAttributes, jsxElement, toParam } from './controls'
import type { ResolvedPlayground } from './model'
import type { PlaygroundValues } from './registry'

const PREFIX = 'p.'
const SURFACES = ['surface', 'grid'] as const
type Surface = (typeof SURFACES)[number]
type ThemeOption = 'site' | PresetName

const label = (name: string) =>
  name.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase())

/** Values for every control, read from `?p.<name>=` and falling back to the starting values. */
function useValues(playground: ResolvedPlayground) {
  const [params, setParams] = useSearchParams()
  const values = useMemo(() => {
    const out: PlaygroundValues = { ...playground.initial }
    for (const control of playground.controls) {
      const parsed = fromParam(control, params.get(PREFIX + control.name))
      if (parsed !== undefined) out[control.name] = parsed
    }
    return out
  }, [params, playground])

  const set = useCallback(
    (name: string, value: unknown) => {
      const control = playground.controls.find((c) => c.name === name)
      if (!control) return
      setParams(
        (current) => {
          const next = new URLSearchParams(current)
          const base = {
            ...control,
            defaultValue: playground.initial[name] ?? control.defaultValue,
          }
          const raw = toParam(base, value)
          if (raw === null) next.delete(PREFIX + name)
          else next.set(PREFIX + name, raw)
          return next
        },
        { replace: true, preventScrollReset: true },
      )
    },
    [playground, setParams],
  )

  const reset = useCallback(() => {
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        for (const key of [...next.keys()]) if (key.startsWith(PREFIX)) next.delete(key)
        return next
      },
      { replace: true, preventScrollReset: true },
    )
  }, [setParams])

  const changed = [...params.keys()].some((key) => key.startsWith(PREFIX))
  return { values, set, reset, changed }
}

function ControlInput({
  control,
  value,
  onChange,
}: {
  control: Control
  value: unknown
  onChange: (value: unknown) => void
}) {
  // Field links its label to the control, so controls must not set their own id.
  switch (control.kind) {
    case 'boolean':
      return (
        <Field orientation="horizontal" label={label(control.name)} className="justify-between">
          <Switch checked={value === true} onCheckedChange={(checked) => onChange(checked)} />
        </Field>
      )
    case 'enum': {
      const options = control.options ?? []
      return (
        <Field label={label(control.name)}>
          {options.length <= 4 && options.join('').length <= 24 ? (
            <SegmentedControl
              size="sm"
              fullWidth
              value={String(value ?? control.defaultValue ?? '')}
              onValueChange={(next) => onChange(next)}
              options={options.map((option) => ({ value: option, label: option }))}
            />
          ) : (
            <Select
              size="sm"
              value={String(value ?? control.defaultValue ?? '')}
              onValueChange={(next) => onChange(next)}
              placeholder="Default"
            >
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </Select>
          )}
        </Field>
      )
    }
    case 'number':
      return (
        <Field label={label(control.name)}>
          <NumberInput
            size="sm"
            value={typeof value === 'number' ? value : null}
            onValueChange={(next) => onChange(next ?? undefined)}
            {...(control.min !== undefined && { min: control.min })}
            {...(control.max !== undefined && { max: control.max })}
            {...(control.step !== undefined && { step: control.step })}
          />
        </Field>
      )
    default:
      return (
        <Field label={label(control.name)}>
          <Input
            size="sm"
            value={typeof value === 'string' ? value : ''}
            onChange={(event) => onChange(event.target.value)}
          />
        </Field>
      )
  }
}

/** The Playground tab: a live, resizable preview driven by generated prop controls. */
export function Playground({ playground }: { playground: ResolvedPlayground }) {
  const { name, Component, controls, config } = playground
  const { values, set, reset, changed } = useValues(playground)
  const [surface, setSurface] = useState<Surface>('surface')
  const [theme, setTheme] = useState<ThemeOption>('site')

  const attrs = jsxAttributes(controls, values)
  const children = typeof values.children === 'string' ? values.children : undefined
  const code = config.code ? config.code(attrs, values) : jsxElement(name, attrs, children)
  const ctx = { set }
  const preview = config.render ? config.render(values, ctx) : <Component {...values} />
  // Remount on every change so uncontrolled defaults (defaultChecked, …) take effect.
  const key = JSON.stringify(values)

  const stage = (
    <div
      data-surface={surface}
      className={[
        'flex h-full min-h-72 items-center justify-center overflow-auto p-8',
        surface === 'grid'
          ? 'bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px] bg-subtle'
          : 'bg-surface',
      ].join(' ')}
    >
      <div className={config.fill ? 'flex w-full justify-center' : 'contents'}>
        <ErrorBoundary
          key={key}
          fallback={
            <Text size="small" tone="muted">
              This combination can't render. Reset to start over.
            </Text>
          }
        >
          {preview}
        </ErrorBoundary>
      </div>
    </div>
  )

  return (
    <div className="grid gap-6" data-testid="playground">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="grid min-w-0 grid-rows-[auto_minmax(0,1fr)] gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <SegmentedControl
              aria-label="Preview background"
              size="sm"
              value={surface}
              onValueChange={setSurface}
              options={[
                { value: 'surface', label: 'Surface' },
                { value: 'grid', label: 'Grid' },
              ]}
            />
            <div className="flex items-center gap-2">
              <Select<ThemeOption>
                aria-label="Preview theme"
                size="sm"
                value={theme}
                onValueChange={setTheme}
                className="w-36"
              >
                <SelectItem value="site">Site theme</SelectItem>
                {(Object.keys(presets) as PresetName[]).map((preset) => (
                  <SelectItem key={preset} value={preset}>
                    {preset[0]!.toUpperCase() + preset.slice(1)}
                  </SelectItem>
                ))}
              </Select>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<RotateCcw />}
                onClick={reset}
                disabled={!changed}
              >
                Reset
              </Button>
            </div>
          </div>
          <div
            className="min-h-72 overflow-hidden rounded-lg border-(length:--glyph-border-width) border-border"
            data-slot="playground-frame"
          >
            {/* Drag the handle to try the component at narrower widths. */}
            <ResizablePanelGroup direction="horizontal" className="h-full min-h-72">
              <ResizablePanel defaultSize={100} minSize={30} id="preview" order={1}>
                {theme === 'site' ? (
                  stage
                ) : (
                  <ThemeScope theme={presets[theme]} className="h-full">
                    {stage}
                  </ThemeScope>
                )}
              </ResizablePanel>
              <ResizableHandle withHandle aria-label="Resize preview" />
              <ResizablePanel
                defaultSize={0}
                minSize={0}
                id="spacer"
                order={2}
                className="bg-subtle"
              />
            </ResizablePanelGroup>
          </div>
        </div>
        <section
          aria-label={`${name} props`}
          className="grid content-start gap-4 rounded-lg border-(length:--glyph-border-width) border-border bg-surface p-4"
        >
          <Text size="small" weight="medium">
            Props
          </Text>
          {controls.map((control) => (
            <ControlInput
              key={control.name}
              control={control}
              value={values[control.name]}
              onChange={(value) => set(control.name, value)}
            />
          ))}
        </section>
      </div>
      <CodeViewer code={code} language="tsx" fileName={`${name}.tsx`} />
    </div>
  )
}
