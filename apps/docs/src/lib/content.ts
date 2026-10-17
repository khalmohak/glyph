import guidesData from 'virtual:glyph-guides'
import type { GuideHeading, GuideInfo, GuideSection } from '../../plugins/guides'

export type { GuideHeading, GuideInfo, GuideSection }

/** Every guide's frontmatter and headings, in reading order (built from src/guides/*.mdx). */
export const guideIndex = guidesData as GuideInfo[]

export function getGuide(slug: string): GuideInfo | undefined {
  return guideIndex.find((guide) => guide.slug === slug)
}
