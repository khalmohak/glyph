import { useParams } from 'react-router'
import { guides } from '../lib/site'
import { ComingSoon } from './coming-soon'
import { GettingStartedPage } from './getting-started'
import { NotFoundPage } from './not-found'

/** /docs/:slug. Getting started is written; the other guides land later in this release. */
export function GuidePage() {
  const { slug = '' } = useParams()
  const guide = guides.find((g) => g.slug === slug)
  if (!guide) return <NotFoundPage />
  if (guide.slug === 'getting-started') return <GettingStartedPage />
  return (
    <ComingSoon
      inDocs
      eyebrow="Guide"
      title={guide.title}
      description={guide.description}
      plans={[
        'A step-by-step guide with runnable examples',
        'Common pitfalls, and how Glyph handles them for you',
      ]}
      links={guide.seeAlso ? [guide.seeAlso] : [{ label: 'All guides', href: '/docs' }]}
    />
  )
}
