import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'FilePreview',
  slug: 'file-preview',
  category: 'Viewers',
  status: 'beta',
  description:
    'Show any file with the right viewer, picked from its name or type, with a download fallback. Pairs with FileUpload.',
  entry: '@glyphui/viewers',
  exports: [
    'FilePreview',
    'filePreviewStyles',
    'FilePreviewDialog',
    'detectFileKind',
    'formatBytes',
  ],
  source: 'file-preview/file-preview.tsx',
  propsOf: 'FilePreview',
  examples: [
    {
      file: 'switcher',
      title: 'Every kind of file',
      description: 'Pick a sample file; the matching viewer loads on demand.',
    },
    {
      file: 'attachments',
      title: 'Previews for uploads',
      description: 'Add files, then open any of them in a dialog.',
    },
  ],
  notes: [
    'Images, video, audio, JSON and plain text work with no extra packages.',
    'PDF, CSV, spreadsheets, code and Markdown need their viewer’s packages. Pass loaders for the ones you use, e.g. loaders={{ pdf: () => import("@glyphui/viewers/pdf") }}, so your bundle only includes what you can show.',
    'Files without a viewer get a clear message and a download button.',
  ],
})
