import { absoluteUrl } from '@/lib/site-url';
import { buildSitemapEntries, SITEMAP_CHUNK_SIZE, xmlEscape, xmlResponse } from '@/lib/sitemap';

export async function GET() {
  try {
    const entries = await buildSitemapEntries();
    const count = Math.ceil(entries.length / SITEMAP_CHUNK_SIZE);
    if (count > 50000) throw new Error('Sitemap index limit exceeded');
    const maps = Array.from({ length: count }, (_, index) => `<sitemap><loc>${xmlEscape(absoluteUrl(`/sitemaps/${index}.xml`))}</loc></sitemap>`).join('');
    return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${maps}</sitemapindex>`);
  } catch {
    return xmlResponse('<?xml version="1.0" encoding="UTF-8"?><error>Sitemap temporarily unavailable</error>', 503);
  }
}
