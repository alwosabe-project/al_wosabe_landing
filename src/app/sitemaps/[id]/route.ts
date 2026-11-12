import { buildSitemapEntries, SITEMAP_CHUNK_SIZE, sitemapXml, xmlResponse } from '@/lib/sitemap';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^(0|[1-9][0-9]*)\.xml$/.test(id)) return xmlResponse('<error>Not found</error>', 404);
  const index = Number(id.slice(0, -4));
  if (!Number.isSafeInteger(index) || index >= 50000) return xmlResponse('<error>Not found</error>', 404);
  try {
    const entries = await buildSitemapEntries();
    const shard = entries.slice(index * SITEMAP_CHUNK_SIZE, (index + 1) * SITEMAP_CHUNK_SIZE);
    if (!shard.length) return xmlResponse('<error>Not found</error>', 404);
    return xmlResponse(sitemapXml(shard));
  } catch {
    return xmlResponse('<error>Sitemap temporarily unavailable</error>', 503);
  }
}
