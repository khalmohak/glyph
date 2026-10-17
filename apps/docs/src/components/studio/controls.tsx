import {
  type ColorMode,
  Field,
  type MotionLevel,
  presets,
  SegmentedControl,
  Select,
  SelectItem,
  Slider,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
  type Theme,
} from '@glyphui/ui'
import type { ReactNode } from 'react'
import {
  type Density,
  densities,
  type EditableColor,
  editableColors,
  type FontRole,
  fonts,
  formatOklch,
  radiusSteps,
  type ShadowStyle,
  type StudioState,
  shadowStyles,
  toOklch,
} from '../../lib/theme-studio'
import { ColorField } from './color-field'

export type Update = (recipe: (state: StudioState) => StudioState) => void

interface ControlsProps {
  state: StudioState
  /** The theme being edited, for current values. */
  theme: Theme
  update: Update
  editMode: ColorMode
  onEditModeChange: (mode: ColorMode) => void
}

const groups: { label: string; tokens: readonly EditableColor[] }[] = [
  { label: 'Brand', tokens: ['primary', 'secondary'] },
  {
    label: 'Surfaces and text',
    tokens: ['background', 'surface', 'foreground', 'muted-foreground', 'border'],
  },
  { label: 'Status', tokens: ['success', 'warning', 'danger', 'info'] },
  { label: 'Charts', tokens: ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'] },
]

const shadowLabel: Record<ShadowStyle, string> = {
  none: 'None',
  soft: 'Soft',
  layered: 'Layered',
  hard: 'Hard offset',
}
const densityLabel: Record<Density, string> = {
  compact: 'Compact',
  default: 'Default',
  comfortable: 'Comfortable',
}

/** The studio's left panel: every control, grouped by what it shapes. */
export function StudioControls({
  state,
  theme,
  update,
  editMode,
  onEditModeChange,
}: ControlsProps) {
  const base = presets[state.base]

  const setColor = (token: EditableColor, value: string | undefined) =>
    update((s) => {
      const modeColors = { ...s.colors?.[editMode] }
      if (value === undefined || value === base.colors[editMode][token]) delete modeColors[token]
      else modeColors[token] = value
      return { ...s, colors: { ...s.colors, [editMode]: modeColors } }
    })

  return (
    <Tabs defaultValue="colors" className="grid gap-4">
      <TabsList className="w-full justify-between overflow-x-auto">
        <TabsTrigger value="colors">Colors</TabsTrigger>
        <TabsTrigger value="type">Type</TabsTrigger>
        <TabsTrigger value="shape">Shape</TabsTrigger>
        <TabsTrigger value="depth">Depth</TabsTrigger>
        <TabsTrigger value="motion">Motion</TabsTrigger>
      </TabsList>

      <TabsContent value="colors" className="grid gap-6">
        <SegmentedControl<ColorMode>
          aria-label="Colors for"
          size="sm"
          value={editMode}
          onValueChange={onEditModeChange}
          options={[
            { value: 'light', label: 'Light mode' },
            { value: 'dark', label: 'Dark mode' },
          ]}
          className="w-full [&>*]:flex-1"
        />
        <BrandSliders
          value={theme.colors[editMode].primary}
          onChange={(value) => setColor('primary', value)}
        />
        {groups.map((group) => (
          <section key={group.label} className="grid gap-3">
            <Text size="small" weight="medium">
              {group.label}
            </Text>
            {group.tokens.map((token) => (
              <ColorField
                key={`${editMode}-${token}`}
                label={token}
                value={theme.colors[editMode][token]}
                changed={state.colors?.[editMode]?.[token] !== undefined}
                onChange={(value) => setColor(token, value)}
                onReset={() => setColor(token, undefined)}
              />
            ))}
          </section>
        ))}
        <Text size="small" tone="muted">
          Text on buttons, badges and links is derived from these so it stays readable.
          {editableColors.length} tokens edited here; the rest follow.
        </Text>
      </TabsContent>

      <TabsContent value="type" className="grid gap-5">
        {(['sans', 'display', 'mono'] as const satisfies readonly FontRole[]).map((role) => (
          <Field key={role} label={roleLabel[role]}>
            <Select
              size="sm"
              value={state.font?.[role] ?? base.font[role]}
              onValueChange={(stack) =>
                update((s) => {
                  const font = { ...s.font }
                  if (stack === base.font[role]) delete font[role]
                  else font[role] = stack
                  return { ...s, font }
                })
              }
            >
              {withCurrent(fonts[role], base.font[role]).map((font) => (
                <SelectItem key={font.stack} value={font.stack}>
                  {font.label}
                </SelectItem>
              ))}
            </Select>
          </Field>
        ))}
        <Field label="Headline tracking">
          <Slider
            min={-0.06}
            max={0.02}
            step={0.005}
            value={Number.parseFloat(state.tracking ?? base.text.display.tracking) || 0}
            showValue={(v) => `${v.toFixed(3)}em`}
            onValueChange={(v) => update((s) => ({ ...s, tracking: `${Number(v.toFixed(3))}em` }))}
          />
        </Field>
        <Field label="Headline weight">
          <SegmentedControl
            size="sm"
            value={state.weight ?? base.text.display.weight}
            onValueChange={(weight) => update((s) => ({ ...s, weight }))}
            options={['400', '500', '600', '700', '800'].map((w) => ({ value: w, label: w }))}
            className="w-full [&>*]:flex-1"
          />
        </Field>
      </TabsContent>

      <TabsContent value="shape" className="grid gap-5">
        {radiusSteps.map((step) => (
          <Field key={step} label={`Radius ${step}`}>
            <Slider
              min={0}
              max={28}
              step={1}
              value={state.radius?.[step] ?? (Number.parseFloat(base.radius[step]) || 0)}
              showValue={(v) => `${v}px`}
              onValueChange={(v) => update((s) => ({ ...s, radius: { ...s.radius, [step]: v } }))}
            />
          </Field>
        ))}
        <Field label="Border width">
          <Slider
            min={0}
            max={4}
            step={1}
            value={state.borderWidth ?? (Number.parseFloat(base.border.width) || 1)}
            showValue={(v) => `${v}px`}
            onValueChange={(v) => update((s) => ({ ...s, borderWidth: v }))}
          />
        </Field>
      </TabsContent>

      <TabsContent value="depth" className="grid gap-5">
        <Field label="Shadows">
          <SegmentedControl<ShadowStyle | 'preset'>
            size="sm"
            value={state.shadow ?? 'preset'}
            onValueChange={(shadow) =>
              update((s) => ({ ...s, shadow: shadow === 'preset' ? undefined : shadow }))
            }
            options={[
              { value: 'preset', label: 'Preset' },
              ...shadowStyles.map((value) => ({ value, label: shadowLabel[value] })),
            ]}
            className="w-full flex-wrap [&>*]:flex-1"
          />
        </Field>
        <Field label="Density" description="Height of buttons, inputs and selects.">
          <SegmentedControl<Density>
            size="sm"
            value={state.density ?? 'default'}
            onValueChange={(density) =>
              update((s) => ({ ...s, density: density === 'default' ? undefined : density }))
            }
            options={densities.map((value) => ({ value, label: densityLabel[value] }))}
            className="w-full [&>*]:flex-1"
          />
        </Field>
      </TabsContent>

      <TabsContent value="motion" className="grid gap-5">
        <Field label="Motion level">
          <SegmentedControl<MotionLevel>
            size="sm"
            value={state.motion?.level ?? base.motion.level ?? 'subtle'}
            onValueChange={(level) => update((s) => ({ ...s, motion: { ...s.motion, level } }))}
            options={[
              { value: 'none', label: 'None' },
              { value: 'subtle', label: 'Subtle' },
              { value: 'expressive', label: 'Expressive' },
            ]}
            className="w-full [&>*]:flex-1"
          />
        </Field>
        <Field label="Spring stiffness" description="Higher is snappier.">
          <Slider
            min={120}
            max={1000}
            step={10}
            value={state.motion?.stiffness ?? base.motion.spring?.stiffness ?? 420}
            showValue
            onValueChange={(stiffness) =>
              update((s) => ({ ...s, motion: { ...s.motion, stiffness } }))
            }
          />
        </Field>
        <Field label="Spring damping" description="Lower bounces more.">
          <Slider
            min={8}
            max={80}
            step={1}
            value={state.motion?.damping ?? base.motion.spring?.damping ?? 34}
            showValue
            onValueChange={(damping) => update((s) => ({ ...s, motion: { ...s.motion, damping } }))}
          />
        </Field>
        <Text size="small" tone="muted">
          Open a menu or switch tabs on the preview to feel it. Visitors who ask for reduced motion
          always get none.
        </Text>
      </TabsContent>
    </Tabs>
  )
}

const roleLabel: Record<FontRole, string> = {
  sans: 'Body and UI font',
  display: 'Headline font',
  mono: 'Code font',
}

/** The preset's own font first if the list doesn't include it. */
function withCurrent(list: readonly { label: string; stack: string }[], current: string) {
  return list.some((f) => f.stack === current)
    ? list
    : [{ label: 'Preset font', stack: current }, ...list]
}

/** Hue, lightness and chroma for the brand color: the fastest way to find a primary. */
function BrandSliders({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const color = toOklch(value) ?? { l: 0.6, c: 0.18, h: 255 }
  const set = (patch: Partial<typeof color>) => onChange(formatOklch({ ...color, ...patch }))
  return (
    <section className="grid gap-3 rounded-lg border border-border bg-subtle p-4">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="size-9 shrink-0 rounded-md border border-border shadow-xs"
          style={{ background: value }}
        />
        <div className="grid min-w-0">
          <Text size="small" weight="medium">
            Brand color
          </Text>
          <Text size="small" tone="muted" className="truncate font-mono">
            {value}
          </Text>
        </div>
      </div>
      <SliderRow label="Hue">
        <Slider
          min={0}
          max={360}
          step={1}
          value={Math.round(color.h)}
          onValueChange={(h) => set({ h })}
          aria-label="Brand hue"
        />
      </SliderRow>
      <SliderRow label="Lightness">
        <Slider
          min={25}
          max={90}
          step={0.5}
          value={Math.round(color.l * 200) / 2}
          onValueChange={(l) => set({ l: l / 100 })}
          aria-label="Brand lightness"
        />
      </SliderRow>
      <SliderRow label="Chroma">
        <Slider
          min={0}
          max={0.3}
          step={0.005}
          value={Math.round(color.c * 200) / 200}
          onValueChange={(c) => set({ c })}
          aria-label="Brand chroma"
        />
      </SliderRow>
    </section>
  )
}

function SliderRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-3">
      <span className="text-caption text-muted-foreground">{label}</span>
      {children}
    </div>
  )
}
