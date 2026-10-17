import {
  Breadcrumb,
  Card,
  Container,
  Eyebrow,
  Heading,
  Select,
  SelectItem,
  Text,
} from '@glyphui/ui'
import { detectFileKind, type FileKind, FilePreview, type ViewerLoaders } from '@glyphui/viewers'
import {
  Braces,
  FileCode2,
  FileImage,
  FileMusic,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Table2,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useSearchParams } from 'react-router'
import { fixture } from '../lib/fixtures'

// Viewers with extra dependencies load only when a file needs them.
const loaders: ViewerLoaders = {
  pdf: () => import('@glyphui/viewers/pdf'),
  csv: () => import('@glyphui/viewers/csv'),
  spreadsheet: () => import('@glyphui/viewers/spreadsheet'),
  code: () => import('@glyphui/viewers/code'),
  markdown: () => import('@glyphui/viewers/markdown'),
}

const files = [
  { name: 'report.pdf', note: 'Six pages, searchable text' },
  { name: 'customers.csv', note: 'Quotes, commas and newlines in cells' },
  { name: 'sales.xlsx', note: 'Two sheets' },
  { name: 'workspace.json', note: 'Nested settings' },
  { name: 'reminders.ts', note: 'TypeScript' },
  { name: 'README.md', note: 'Markdown with code' },
  { name: 'aurora.jpg', note: 'Zoom and pan' },
  { name: 'chime.wav', note: 'Waveform' },
  { name: 'clip.webm', note: 'With captions' },
] as const

type FileName = (typeof files)[number]['name']

const kindIcon: Partial<Record<FileKind, ReactNode>> = {
  pdf: <FileText />,
  csv: <Table2 />,
  spreadsheet: <FileSpreadsheet />,
  json: <Braces />,
  code: <FileCode2 />,
  markdown: <FileText />,
  image: <FileImage />,
  audio: <FileMusic />,
  video: <FileVideo />,
}

/** A file browser: pick a file on the left, preview it on the right with the right viewer. */
export function ViewersTemplatePage() {
  const [params, setParams] = useSearchParams()
  const requested = params.get('file')
  const current: FileName = files.some((f) => f.name === requested)
    ? (requested as FileName)
    : 'report.pdf'
  const select = (name: FileName) =>
    setParams({ file: name }, { replace: true, preventScrollReset: true })

  return (
    <Container size="full" className="grid max-w-[1440px] gap-8 py-10 sm:py-14">
      <header className="grid max-w-2xl gap-3">
        <Breadcrumb
          items={[{ label: 'Templates', href: '/templates' }, { label: 'File browser' }]}
        />
        <Eyebrow>Template</Eyebrow>
        <Heading level={1}>File browser</Heading>
        <Text size="lead" tone="muted">
          One <code className="font-mono">FilePreview</code> picks the right viewer for each file
          type. Viewers with heavy dependencies load the first time they are needed.
        </Text>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Card padding="none" className="overflow-hidden max-lg:hidden">
          <nav aria-label="Files">
            <ul className="grid gap-0.5 p-2">
              {files.map((file) => {
                const active = file.name === current
                return (
                  <li key={file.name}>
                    <button
                      type="button"
                      aria-current={active ? 'true' : undefined}
                      onClick={() => select(file.name)}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-left outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring aria-[current]:bg-muted [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-muted-foreground"
                    >
                      {kindIcon[detectFileKind({ name: file.name })] ?? <FileText />}
                      <span className="grid min-w-0">
                        <span className="truncate text-small font-medium">{file.name}</span>
                        <span className="truncate text-caption text-muted-foreground">
                          {file.note}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>
        </Card>
        <div className="lg:hidden">
          <Select<FileName> aria-label="File" value={current} onValueChange={select}>
            {files.map((file) => (
              <SelectItem key={file.name} value={file.name}>
                {file.name}
              </SelectItem>
            ))}
          </Select>
        </div>
        <FilePreview
          key={current}
          file={fixture(current)}
          name={current}
          loaders={loaders}
          height={640}
          className="min-w-0"
        />
      </div>
    </Container>
  )
}
