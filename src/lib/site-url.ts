// Server configuration is the only authority for canonical URLs.
export function siteOrigin() {
  const url = new URL(process.env.SITE_URL || 'https://alwosabifortrading.com');
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('SITE_URL must be an HTTP(S) origin');
  return url.origin;
}
export function absoluteUrl(path: string) { return new URL(path, `${siteOrigin()}/`).href; }
export function productionIndexing() { return process.env.NODE_ENV === 'production' && process.env.SITE_INDEXABLE === 'true'; }
