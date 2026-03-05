/**
 * Normalizes a base URL by trimming whitespace, ensuring an https:// scheme
 * is present, and removing a trailing slash.
 */
export function normalizeBaseUrl(url: string): string {
  const trimmed = url.trim()
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  return withScheme.replace(/\/$/, "")
}
