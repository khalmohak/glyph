import type Papa from 'papaparse'
import { blobBytes, detectEncoding } from '../internal/source'

export interface CsvParseError {
  /** 1-based data row the problem was found on. */
  row: number
  message: string
}

export interface CsvParseResult {
  rows: string[][]
  /** The delimiter used, detected or given. */
  delimiter: string
  errors: CsvParseError[]
  /** True when parsing stopped at `maxRows`. */
  truncated: boolean
}

export interface CsvParseOptions {
  /** `''` or undefined detects it. */
  delimiter?: string
  /** Stop after this many rows. */
  maxRows?: number
  /** Called with 0–1 while large inputs parse. */
  onProgress?: (progress: number) => void
  signal?: AbortSignal
}

/** Inputs this size or larger parse in a Web Worker, in chunks, with progress. */
export const WORKER_THRESHOLD = 1024 * 1024

/**
 * Parses CSV text or a file with papaparse (loaded on first use). Handles quotes, escaped
 * quotes, newlines inside quoted cells, a byte-order mark and any delimiter.
 */
export async function parseCsv(
  input: string | Blob,
  { delimiter = '', maxRows, onProgress, signal }: CsvParseOptions = {},
): Promise<CsvParseResult> {
  const papa = (await import('papaparse')).default
  const size = typeof input === 'string' ? input.length : input.size
  const big = size >= WORKER_THRESHOLD
  // papaparse reads Files, not bare Blobs; a BOM in text input would end up in the first header.
  const text =
    typeof input === 'string'
      ? input.replace(/^\uFEFF/, '')
      : input instanceof File
        ? input
        : new File([input], 'data.csv', { type: input.type })
  // papaparse reads files as UTF-8 unless told otherwise; Excel writes Windows-1252 or UTF-16.
  const encoding =
    typeof input === 'string'
      ? undefined
      : detectEncoding(new Uint8Array(await blobBytes(input.slice(0, 64 * 1024))))

  return new Promise((resolve, reject) => {
    const rows: string[][] = []
    const errors: CsvParseError[] = []
    let detected = delimiter
    let truncated = false
    let done = false

    const finish = () => {
      if (done) return
      done = true
      // A trailing newline leaves one empty row; drop fully empty rows anywhere.
      resolve({
        rows: rows.filter((r) => !(r.length === 1 && r[0] === '')),
        delimiter: detected || ',',
        errors,
        truncated,
      })
    }

    signal?.addEventListener('abort', () => {
      if (!done) {
        done = true
        reject(new DOMException('Parsing was cancelled.', 'AbortError'))
      }
    })

    const config = {
      delimiter,
      ...(encoding && encoding !== 'utf-8' && { encoding }),
      skipEmptyLines: false,
      worker: big && typeof Worker !== 'undefined' && papa.WORKERS_SUPPORTED,
      chunk: (results: Papa.ParseResult<string[]>, parser: Papa.Parser) => {
        if (done) {
          parser.abort()
          return
        }
        detected ||= results.meta.delimiter
        for (const error of results.errors) {
          // "Couldn't detect the delimiter" isn't a broken row: it falls back to a comma.
          if (error.type === 'Delimiter') continue
          if (errors.length < 100) {
            errors.push({ row: rows.length + (error.row ?? 0) + 1, message: error.message })
          }
        }
        for (const row of results.data) {
          if (maxRows !== undefined && rows.length >= maxRows) {
            truncated = true
            parser.abort()
            break
          }
          rows.push(row)
        }
        if (onProgress && size > 0) onProgress(Math.min(1, results.meta.cursor / size))
      },
      complete: finish,
      error: (error: Error) => {
        if (!done) {
          done = true
          reject(error)
        }
      },
    }
    // papaparse's overloads can't express a `worker` flag chosen at runtime.
    papa.parse<string[]>(text as File, config as never)
  })
}

/** Human names for common delimiters. */
export const delimiterNames: Record<string, string> = {
  ',': 'Comma',
  ';': 'Semicolon',
  '\t': 'Tab',
  '|': 'Pipe',
}
