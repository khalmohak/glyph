import {
  Badge,
  Button,
  Card,
  type ContrastIssue,
  EmptyState,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
  type Theme,
} from '@glyphui/ui'
import { CheckCircle2, Wand2 } from 'lucide-react'
import { useMemo } from 'react'

interface AuditProps {
  theme: Theme
  issues: ContrastIssue[]
  /** Replaces a failing color with one that passes. */
  onFix: (issue: ContrastIssue) => void
}

const kindLabel = { text: 'Text', graphic: 'Graphic', 'chart-distance': 'Chart series' } as const

/** WCAG AA results for every color pair the components render, in both modes. */
export function ContrastAudit({ theme, issues, onFix }: AuditProps) {
  // One row per token and mode: the worst background it fails on.
  const rows = useMemo(() => {
    const worst = new Map<string, ContrastIssue>()
    for (const issue of issues) {
      const key = `${issue.mode}:${issue.foreground}:${issue.kind}`
      const seen = worst.get(key)
      const gap = issue.required - issue.value
      if (!seen || gap > seen.required - seen.value) worst.set(key, issue)
    }
    return [...worst.values()]
  }, [issues])

  return (
    <Card className="gap-4" data-testid="contrast-audit">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="grid gap-0.5">
          <Text weight="medium">Contrast check</Text>
          <Text size="small" tone="muted">
            Every text and graphic pair Glyph renders, against WCAG AA, in light and dark.
          </Text>
        </div>
        {rows.length === 0 ? (
          <Badge tone="success" dot>
            All pass
          </Badge>
        ) : (
          <Badge tone="danger" dot>
            {rows.length} to fix
          </Badge>
        )}
      </div>
      {rows.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 />}
          title="Readable everywhere"
          description="Every pair meets 4.5:1 for text and 3:1 for graphics in both modes."
          className="py-6"
        />
      ) : (
        <div className="overflow-x-auto">
          <Table aria-label="Contrast issues">
            <TableHeader>
              <TableRow>
                <TableHead>Color</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Kind</TableHead>
                <TableHead className="text-right">Ratio</TableHead>
                <TableHead>
                  <span className="sr-only">Fix</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((issue) => (
                <TableRow key={`${issue.mode}:${issue.foreground}:${issue.kind}`}>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="size-4 shrink-0 rounded-xs border border-border"
                        style={{ background: theme.colors[issue.mode][issue.foreground] }}
                      />
                      <span className="font-mono text-caption">{issue.foreground}</span>
                    </span>
                  </TableCell>
                  <TableCell className="capitalize">{issue.mode}</TableCell>
                  <TableCell className="text-muted-foreground">{kindLabel[issue.kind]}</TableCell>
                  <TableCell className="text-right font-mono text-caption tabular-nums">
                    {issue.kind === 'chart-distance'
                      ? `${issue.value.toFixed(2)} / ${issue.required}`
                      : `${issue.value.toFixed(2)}:1 / ${issue.required}`}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<Wand2 />}
                      onClick={() => onFix(issue)}
                      aria-label={`Fix ${issue.foreground} in ${issue.mode} mode`}
                    >
                      Fix
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  )
}
