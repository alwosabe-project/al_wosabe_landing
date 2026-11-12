import type {MetadataRoute} from 'next';
import {absoluteUrl,productionIndexing} from '@/lib/site-url';
import {getSeoSettings} from '@/lib/seo';
export default async function robots():Promise<MetadataRoute.Robots> {
  const settings=await getSeoSettings();const indexable=productionIndexing()&&settings.indexable!==false;
  return {rules:{userAgent:'*',...(indexable?{allow:'/',disallow:['/api/','/admin/','/ar/blog/preview/','/en/blog/preview/',...(settings.excludedPaths||[])]}:{disallow:'/'})},sitemap:absoluteUrl('/sitemap.xml')};
}
