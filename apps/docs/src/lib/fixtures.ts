/** URL of a sample file in `public/fixtures`, under the site's base path. */
export function fixture(name: string): string {
  return `${import.meta.env.BASE_URL}fixtures/${name}`
}
