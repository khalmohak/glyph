/** The kinds of file FilePreview can show. */
export type FileKind =
  | 'pdf'
  | 'csv'
  | 'spreadsheet'
  | 'json'
  | 'markdown'
  | 'code'
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'unknown'

const byExtension: Record<string, FileKind> = {
  pdf: 'pdf',
  csv: 'csv',
  tsv: 'csv',
  xlsx: 'spreadsheet',
  xlsm: 'spreadsheet',
  json: 'json',
  geojson: 'json',
  md: 'markdown',
  markdown: 'markdown',
  mdx: 'markdown',
  txt: 'text',
  log: 'text',
  png: 'image',
  jpg: 'image',
  jpeg: 'image',
  gif: 'image',
  webp: 'image',
  avif: 'image',
  svg: 'image',
  bmp: 'image',
  ico: 'image',
  mp4: 'video',
  webm: 'video',
  mov: 'video',
  m4v: 'video',
  ogv: 'video',
  mp3: 'audio',
  wav: 'audio',
  ogg: 'audio',
  oga: 'audio',
  m4a: 'audio',
  aac: 'audio',
  flac: 'audio',
  opus: 'audio',
}

const codeExtensions = new Set([
  'js',
  'mjs',
  'cjs',
  'jsx',
  'ts',
  'mts',
  'cts',
  'tsx',
  'py',
  'rb',
  'go',
  'rs',
  'java',
  'kt',
  'swift',
  'c',
  'h',
  'cpp',
  'hpp',
  'cs',
  'php',
  'sql',
  'sh',
  'bash',
  'zsh',
  'yaml',
  'yml',
  'toml',
  'ini',
  'xml',
  'html',
  'htm',
  'css',
  'scss',
  'less',
  'vue',
  'svelte',
  'graphql',
  'gql',
  'lua',
  'r',
  'dart',
  'scala',
  'ex',
  'exs',
  'erl',
  'hs',
  'clj',
  'tf',
  'proto',
  'diff',
  'patch',
  'dockerfile',
  'makefile',
])

const byMime: Record<string, FileKind> = {
  'application/pdf': 'pdf',
  'text/csv': 'csv',
  'text/tab-separated-values': 'csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'spreadsheet',
  'application/json': 'json',
  'application/ld+json': 'json',
  'text/markdown': 'markdown',
  'text/plain': 'text',
}

/**
 * Picks a viewer for a file from its name and MIME type. The extension wins when both are
 * known, since browsers often report generic types like `application/octet-stream`.
 */
export function detectFileKind({
  name,
  type,
}: {
  name?: string | undefined
  type?: string | undefined
}): FileKind {
  const base = name?.split(/[?#]/)[0]?.split('/').pop()?.toLowerCase() ?? ''
  const ext = base.includes('.') ? (base.split('.').pop() ?? '') : base
  if (ext && byExtension[ext]) return byExtension[ext]
  if (ext && codeExtensions.has(ext)) return 'code'
  const mime = type?.split(';')[0]?.trim().toLowerCase() ?? ''
  if (byMime[mime]) return byMime[mime]
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('video/')) return 'video'
  if (mime.startsWith('audio/')) return 'audio'
  if (mime.startsWith('text/')) return 'text'
  return 'unknown'
}
