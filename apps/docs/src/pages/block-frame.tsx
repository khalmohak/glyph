import { ErrorState, LoadingState } from '@glyphui/ui'
import { Suspense, useEffect, useRef } from 'react'
import { useParams } from 'react-router'
import { ErrorBoundary } from '../components/error-boundary'
import { previewFor } from '../components/example-view'
import { getDoc } from '../lib/catalog'

/** Message a block frame posts to the gallery when its content height changes. */
export interface BlockFrameMessage {
  type: 'glyph:block-frame-height'
  height: number
}

/**
 * One block example on its own page, without the site chrome. The blocks gallery loads it in
 * an iframe, so the block's responsive layout reacts to the frame's width, not the window's.
 */
export function BlockFramePage() {
  const { slug = '', file = '' } = useParams()
  const doc = getDoc(slug)
  const example = doc?.examples?.find((e) => e.file === file)
  const main = useRef<HTMLElement>(null)

  // Tell the gallery how tall the content is, so the frame never scrolls on its own.
  // Measure the content, not the document: the document is never shorter than the frame, so
  // a frame could grow but never shrink back after a width change.
  useEffect(() => {
    const el = main.current
    if (!el || window.parent === window) return
    const post = () =>
      window.parent.postMessage(
        {
          type: 'glyph:block-frame-height',
          height: Math.ceil(el.getBoundingClientRect().height),
        } satisfies BlockFrameMessage,
        window.location.origin,
      )
    const observer = new ResizeObserver(post)
    observer.observe(el)
    post()
    return () => observer.disconnect()
  }, [])

  if (!doc || !example)
    return <ErrorState className="p-8" error={new Error(`No block example ${slug}/${file}.`)} />

  const Preview = previewFor(slug, file)
  return (
    <main ref={main} className="bg-background text-foreground">
      <ErrorBoundary
        fallback={<ErrorState className="p-8" error={new Error('This block failed to render.')} />}
      >
        <Suspense fallback={<LoadingState label="Loading block" className="py-16" />}>
          <Preview />
        </Suspense>
      </ErrorBoundary>
    </main>
  )
}
