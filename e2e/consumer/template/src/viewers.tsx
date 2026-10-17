import { FilePreview, type ViewerLoaders } from '@glyphui/viewers'
import { CodeViewer } from '@glyphui/viewers/code'
import { CsvViewer } from '@glyphui/viewers/csv'
import { DiffViewer } from '@glyphui/viewers/diff'
import { JsonViewer } from '@glyphui/viewers/json'
import { MarkdownViewer } from '@glyphui/viewers/markdown'
import { AudioPlayer, ImageViewer, VideoPlayer, Waveform } from '@glyphui/viewers/media'
import { PdfViewer, setPdfWorker } from '@glyphui/viewers/pdf'
import { SpreadsheetViewer } from '@glyphui/viewers/spreadsheet'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

setPdfWorker(pdfWorker)

const loaders: ViewerLoaders = {
  pdf: () => import('@glyphui/viewers/pdf'),
  csv: () => import('@glyphui/viewers/csv'),
  spreadsheet: () => import('@glyphui/viewers/spreadsheet'),
  code: () => import('@glyphui/viewers/code'),
  markdown: () => import('@glyphui/viewers/markdown'),
}

export function Viewers({ file }: { file?: File }) {
  return (
    <div>
      <PdfViewer source="/report.pdf" defaultZoom="fit-page" onPageChange={(page) => page} />
      <CsvViewer content={'a,b\n1,2'} header="auto" />
      <SpreadsheetViewer source="/sales.xlsx" defaultSheet="Targets" />
      <JsonViewer data={{ ok: true }} defaultExpandDepth={1} />
      <CodeViewer code="const a = 1" language="ts" highlightLines="1" />
      <MarkdownViewer content="# Hello" />
      <DiffViewer oldValue="a" newValue="b" defaultView="split" />
      <ImageViewer source="/photo.jpg" alt="Photo" />
      <VideoPlayer
        source="/clip.webm"
        tracks={[{ src: '/clip.vtt', srcLang: 'en', label: 'English' }]}
      />
      <AudioPlayer source="/a.wav" />
      <Waveform peaks={[0.2, 1]} currentTime={0} duration={10} onSeek={() => {}} />
      {file && <FilePreview file={file} loaders={loaders} />}
    </div>
  )
}
