import type { MetadataRoute } from 'next';
import { apiGet, type ApiList, type Product, type BlogPost, type Brand, type Category, type BlogTaxonomy, type SeoContent } from './api';
import { absoluteUrl, productionIndexing } from './site-url';
import { isExcluded, languagePaths, type SeoSettings } from './seo';

export const SITEMAP_CHUNK_SIZE = 5000;
type SitemapItem = SeoContent & { slug: string };

async function allPages<T>(path: string, tags: string[]) {
  const result: T[] = [];
  let page = 1, totalPages = 1;
  do {
    const response = await apiGet<ApiList<T>>(`${path}${path.includes('?') ? '&' : '?'}page=${page}&limit=100`, tags);
    if (!Array.isArray(response.data) || !Number.isSafeInteger(response.meta?.totalPages) || response.meta.totalPages < 1 || response.meta.totalPages > 1000000) throw new Error('Sitemap pagination unavailable');
    result.push(...response.data);
    totalPages = response.meta.totalPages;
    page++;
  } while (page <= totalPages);
  return result;
}

/** A failed dependency must fail the sitemap, never publish a successful partial list. */
export async function buildSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  if (!productionIndexing()) return [];
  const settings = (await apiGet<{ data: SeoSettings }>('/api/v1/public/seo/settings', ['seo', 'settings'])).data;
  if (settings.indexable === false) return [];
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of ['ar', 'en'] as const) {
    const [products, posts, categories, brands, blogCategories, tags] = await Promise.all([
      allPages<Product>(`/api/v1/public/products?locale=${locale}`, ['products']),
      allPages<BlogPost>(`/api/v1/public/blog/posts?locale=${locale}`, ['blog-posts']),
      apiGet<{ data: Category[] }>(`/api/v1/public/categories?locale=${locale}`, ['categories']).then((response) => response.data),
      apiGet<{ data: Brand[] }>(`/api/v1/public/brands?locale=${locale}`, ['brands']).then((response) => response.data),
      apiGet<{ data: BlogTaxonomy[] }>(`/api/v1/public/blog/categories?locale=${locale}`, ['blog-posts', 'blog-categories']).then((response) => response.data),
      apiGet<{ data: BlogTaxonomy[] }>(`/api/v1/public/blog/tags?locale=${locale}`, ['blog-posts', 'blog-tags']).then((response) => response.data),
    ]);
    for (const suffix of ['', '/products', '/blog']) {
      if ((suffix === '/products' && !products.length) || (suffix === '/blog' && !posts.length)) continue;
      const path = `/${locale}${suffix}`;
      if (!isExcluded(path, settings)) entries.push({
        url: absoluteUrl(path),
        alternates: { languages: Object.fromEntries(Object.entries(languagePaths(locale, path)).filter(([, url]) => !isExcluded(url, settings)).map(([lang, url]) => [lang, absoluteUrl(url)])) },
      });
    }
    const add = (items: SitemapItem[], section: string) => {
      for (const item of items) {
        const path = `/${locale}/${section}/${encodeURIComponent(item.slug)}`;
        if (item.indexable === false || item.publishedItemCount === 0 || isExcluded(path, settings) || (item.alternateSlugs && !item.alternateSlugs[locale])) continue;
        const updated = item.updatedAt ? new Date(item.updatedAt) : undefined;
        entries.push({
          url: absoluteUrl(path),
          ...(updated && !Number.isNaN(updated.getTime()) ? { lastModified: updated } : {}),
          alternates: { languages: Object.fromEntries(Object.entries(languagePaths(locale, path, section, item.alternateSlugs)).filter(([, url]) => !isExcluded(url, settings)).map(([lang, url]) => [lang, absoluteUrl(url)])) },
        });
      }
    };
    add(products, 'products'); add(categories, 'categories'); add(brands, 'brands');
    add(posts, 'blog'); add(blogCategories, 'blog/categories'); add(tags, 'blog/tags');
  }
  // Stable ordering keeps shard membership consistent between index and shard requests.
  return [...new Map(entries.map((entry) => [entry.url, entry])).values()].sort((left, right) => left.url < right.url ? -1 : left.url > right.url ? 1 : 0);
}

export function xmlEscape(value: unknown) {
  const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };
  return String(value).replace(/[&<>"']/g, (character) => entities[character]);
}

export function sitemapXml(entries: MetadataRoute.Sitemap) {
  const urls = entries.map((entry) => {
    const lastModified = entry.lastModified instanceof Date ? entry.lastModified.toISOString() : entry.lastModified ? new Date(entry.lastModified).toISOString() : undefined;
    const alternates = Object.entries(entry.alternates?.languages ?? {}).map(([language, href]) => `<xhtml:link rel="alternate" hreflang="${xmlEscape(language)}" href="${xmlEscape(href)}"/>`).join('');
    return `<url><loc>${xmlEscape(entry.url)}</loc>${lastModified ? `<lastmod>${xmlEscape(lastModified)}</lastmod>` : ''}${alternates}</url>`;
  }).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`;
}

export function xmlResponse(xml: string, status = 200) {
  return new Response(xml, { status, headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': status === 200 ? 'public, max-age=300' : 'no-store', 'x-content-type-options': 'nosniff' } });
}
