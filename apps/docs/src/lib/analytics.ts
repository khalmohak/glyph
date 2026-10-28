import type { PostHog } from 'posthog-js'
import { LIVE_URL } from './site'

/**
 * Product analytics with PostHog: pageviews on every route change, autocaptured clicks, and the
 * named events below. Runs only on the live site with POSTHOG_KEY set at build time, so local
 * dev, tests and PR previews send nothing. Events go through /ingest on this site
 * (functions/ingest), which ad blockers leave alone.
 */

const KEY = process.env.POSTHOG_KEY ?? ''
/** PostHog's app, for links from the toolbar. Must match the region in functions/ingest. */
const UI_HOST = 'https://us.posthog.com'

type Properties = Record<string, string | number | boolean | null | undefined>

let client: PostHog | undefined
let enabled = false
const pending: [string, Properties | undefined][] = []

export function startAnalytics() {
  if (!KEY || window.location.hostname !== new URL(LIVE_URL).hostname) return
  enabled = true
  // Its own chunk, fetched right away so UTM tags and the referrer are read on the landing URL.
  void import('posthog-js').then(({ default: posthog }) => {
    posthog.init(KEY, {
      api_host: `${window.location.origin}/ingest`,
      ui_host: UI_HOST,
      defaults: '2026-08-30',
      person_profiles: 'identified_only',
    })
    client = posthog
    for (const [event, properties] of pending.splice(0)) posthog.capture(event, properties)
  })
}

export type AnalyticsEvent =
  | 'install_command_copied'
  | 'code_copied'
  | 'page_copied_as_markdown'
  | 'page_opened_externally'
  | 'search_result_selected'
  | 'theme_preset_selected'
  | 'theme_exported'
  | 'theme_link_copied'
  | 'theme_applied'

/** Records an event. A no-op where analytics is off; queued until PostHog has loaded. */
export function track(event: AnalyticsEvent, properties?: Properties) {
  if (client) client.capture(event, properties)
  else if (enabled) pending.push([event, properties])
}
