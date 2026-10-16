import { defineDoc } from '../../lib/doc'

export default defineDoc({
  name: 'FileUpload',
  slug: 'file-upload',
  category: 'Forms',
  status: 'beta',
  description:
    'Drag-and-drop or click to choose files, with type, size and count checks and a file list with progress.',
  entry: '@glyphui/ui',
  exports: ['FileUpload', 'formatBytes', 'matchesAccept', 'fileUploadStyles'],
  source: 'components/file-upload/file-upload.tsx',
  propsOf: 'FileUpload',
  examples: [
    { file: 'basic', title: 'Images up to 5 MB' },
    {
      file: 'progress',
      title: 'Uploading with progress',
      description:
        'FileUpload never uploads; set progress and error on items from your own upload code.',
    },
  ],
  notes: [
    'The dropzone is a button: Enter or Space opens the file picker.',
    'Rejected files are reported in a live region and through onReject with a reason: too-large, wrong-type or too-many.',
  ],
})
