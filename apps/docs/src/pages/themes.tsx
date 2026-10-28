import {
  auditContrast,
  Badge,
  Button,
  type ColorMode,
  Container,
  type ContrastIssue,
  Eyebrow,
  Heading,
  type PresetName,
  SegmentedControl,
  Text,
  type Theme,
  toast,
} from '@glyphui/ui'
import { Check, Link2, Moon, RotateCcw, Sun } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { ContrastAudit } from '../components/studio/audit'
import { StudioBoard } from '../components/studio/board'
import { StudioControls, type Update } from '../components/studio/controls'
import { ExportPanel } from '../components/studio/export-panel'
import { track } from '../lib/analytics'
import {
  buildTheme,
  decodeState,
  encodeState,
  fixColor,
  isPristine,
  presetNames,
  type StudioState,
  themeFile,
} from '../lib/theme-studio'
import { presetLabel } from '../shell/theme-controls'
import { useThemeChoice } from '../theme-choice'

/** Live preview needs its own scope name, so it never collides with the site's theme. */
const PREVIEW_NAME = 'studio-preview'

/** The theme studio: tune a theme on real components, check contrast, export the file. */
export function ThemesPage() {
  const [params, setParams] = useSearchParams()
  const { theme: siteTheme, custom, setCustom } = useThemeChoice()
  const [state, setState] = useState<StudioState>(
    () => decodeState(params.get('t')) ?? custom ?? { base: siteTheme },
  )
  const [editMode, setEditMode] = useState<ColorMode>('light')
  const [boardMode, setBoardMode] = useState<ColorMode>('light')

  const update: Update = (recipe) => setState((s) => recipe(s))

  // The live theme. A value the engine can't use keeps the last good theme on screen.
  const lastGood = useRef<Theme | null>(null)
  const theme = useMemo(() => {
    try {
      lastGood.current = buildTheme({ ...state, name: PREVIEW_NAME })
    } catch {
      // Keep showing the previous theme while a value is half-typed.
    }
    return lastGood.current ?? buildTheme({ base: state.base, name: PREVIEW_NAME })
  }, [state])

  const issues = useMemo<ContrastIssue[]>(() => {
    try {
      return auditContrast(theme)
    } catch {
      return []
    }
  }, [theme])

  const code = useMemo(() => themeFile(state), [state])

  // Keep the URL shareable without adding history entries on every slider move.
  useEffect(() => {
    const timer = setTimeout(() => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current)
          if (isPristine(state) && state.base === 'glyph') next.delete('t')
          else next.set('t', encodeState(state))
          return next
        },
        { replace: true, preventScrollReset: true },
      )
    }, 250)
    return () => clearTimeout(timer)
  }, [state, setParams])

  const fix = (issue: ContrastIssue) => {
    const color = fixColor(theme, issues, issue)
    update((s) => ({
      ...s,
      colors: {
        ...s.colors,
        [issue.mode]: { ...s.colors?.[issue.mode], [issue.foreground]: color },
      },
    }))
    toast.success(`${issue.foreground} adjusted`, { description: color })
  }

  const applied = custom !== null && encodeState(custom) === encodeState(state)

  return (
    <Container size="full" className="grid max-w-[1600px] gap-8 py-10 sm:py-14">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div className="grid max-w-2xl gap-3">
          <Eyebrow>Theme studio</Eyebrow>
          <Heading level={1}>Design your theme</Heading>
          <Text size="lead" tone="muted">
            Start from a preset, tune colors, type, shape and motion on real components, and export
            a typed <code className="font-mono">glyph.theme.ts</code>. Contrast is checked as you
            go.
          </Text>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RotateCcw />}
            disabled={isPristine(state)}
            onClick={() => setState({ base: state.base })}
          >
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Link2 />}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(window.location.href)
                track('theme_link_copied', { base: state.base })
                toast.success('Link copied', { description: 'Anyone with it sees this theme.' })
              } catch {
                toast.error('Couldn’t copy the link')
              }
            }}
          >
            Copy link
          </Button>
          <Button
            size="sm"
            leftIcon={applied ? <Check /> : undefined}
            disabled={applied}
            onClick={() => {
              setCustom(state)
              track('theme_applied', { base: state.base })
              toast.success('Theme applied to the whole site')
            }}
          >
            {applied ? 'Applied to site' : 'Apply to site'}
          </Button>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <Text size="small" tone="muted">
          Start from
        </Text>
        <SegmentedControl<PresetName>
          aria-label="Start from preset"
          size="sm"
          value={state.base}
          onValueChange={(base) => setState({ base })}
          options={presetNames.map((name) => ({ value: name, label: presetLabel(name) }))}
        />
        {!isPristine(state) && (
          <Badge tone="primary" dot>
            Edited
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside
          aria-label="Theme controls"
          className="rounded-xl border border-border bg-surface p-4 shadow-sm lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto"
        >
          <StudioControls
            state={state}
            theme={theme}
            update={update}
            editMode={editMode}
            onEditModeChange={(mode) => {
              setEditMode(mode)
              setBoardMode(mode)
            }}
          />
        </aside>

        <section aria-label="Preview" className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6">
          <div className="flex items-center justify-between gap-3">
            <Text size="small" tone="muted">
              Live preview: everything below is interactive.
            </Text>
            <SegmentedControl<ColorMode>
              aria-label="Preview mode"
              size="sm"
              value={boardMode}
              onValueChange={setBoardMode}
              options={[
                {
                  value: 'light',
                  label: (
                    <span className="flex items-center gap-1.5 [&>svg]:size-3.5">
                      <Sun aria-hidden="true" /> Light
                    </span>
                  ),
                },
                {
                  value: 'dark',
                  label: (
                    <span className="flex items-center gap-1.5 [&>svg]:size-3.5">
                      <Moon aria-hidden="true" /> Dark
                    </span>
                  ),
                },
              ]}
            />
          </div>
          <StudioBoard theme={theme} mode={boardMode} />
          <ContrastAudit theme={theme} issues={issues} onFix={fix} />
          <ExportPanel code={code} />
        </section>
      </div>
    </Container>
  )
}
