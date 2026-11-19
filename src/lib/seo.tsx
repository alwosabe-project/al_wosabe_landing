import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { apiGet } from './api';
import type { Locale } from './locales';
import { siteMeta } from '@/data/site';
import { absoluteUrl, productionIndexing, siteOrigin } from './site-url';

export interface SeoSettings {
  siteNameAr?:string; siteNameEn?:string; companyNameAr?:string; companyNameEn?:string;
  homeTitleAr?:string; homeTitleEn?:string; homeDescriptionAr?:string; homeDescriptionEn?:string;
  defaultTitleAr?:string; defaultTitleEn?:string; defaultDescriptionAr?:string; defaultDescriptionEn?:string;
  ogTitleAr?:string; ogTitleEn?:string; ogDescriptionAr?:string; ogDescriptionEn?:string;
  twitterTitleAr?:string; twitterTitleEn?:string; twitterDescriptionAr?:string; twitterDescriptionEn?:string;
  defaultImageUrl?:string; logoUrl?:string; indexable?:boolean; follow?:boolean;
  excludedPaths?:string[]; googleVerification?:string; bingVerification?:string; socialLinks?:string[];
}
export async function getSeoSettings():Promise<SeoSettings> {
  try { return (await apiGet<{data:SeoSettings}>('/api/v1/public/seo/settings',['seo','settings'])).data; }
  catch { return {}; }
}
export const localized = (ar:string|undefined,en:string|undefined,locale:Locale) => (locale==='ar'?ar:en) || '';
export function languagePaths(locale:Locale,path:string,section?:string,slugs?:Record<string,string>) {
  if (!section) return {ar:path.replace(/^\/(ar|en)(?=\/|$)/,'/ar'),en:path.replace(/^\/(ar|en)(?=\/|$)/,'/en')};
  const paths:Record<string,string> = {[locale]:path};
  const query=path.includes('?')?path.slice(path.indexOf('?')):'';
  for (const lang of ['ar','en']) if (slugs?.[lang]) paths[lang]=`/${lang}/${section}/${encodeURIComponent(slugs[lang])}${query}`;
  return paths;
}
export function isExcluded(path:string,settings:SeoSettings) {
  const decoded=(value:string)=>{try{return decodeURI(value)}catch{return value}};
  const current=decoded(path).split('?')[0];
  return settings.excludedPaths?.some(value=>{
    const pattern=decoded(value).replace(/\/+$/,'');
    if(!pattern.includes('*'))return current===pattern||current.startsWith(`${pattern}/`);
    const escaped=pattern.split('*').map(part=>part.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('.*');
    return new RegExp(`^${escaped}(?:/|$)`).test(current);
  })??false;
}
export async function pageMetadata({locale,path,title,description,image,indexable=true,languages,type='website'}:{locale:Locale;path:string;title?:string;description?:string;image?:string;indexable?:boolean;languages?:Record<string,string>;type?:'website'|'article'}):Promise<Metadata> {
  const s=await getSeoSettings();
  const name=localized(s.siteNameAr,s.siteNameEn,locale)|| (locale==='ar'?'الوصابي للتجارة':'Al-Wosabe for Trading');
  const resolvedTitle=title||localized(s.defaultTitleAr,s.defaultTitleEn,locale)||siteMeta[locale].title;
  const resolvedDescription=description||localized(s.defaultDescriptionAr,s.defaultDescriptionEn,locale)||siteMeta[locale].description;
  const img=image||s.defaultImageUrl||'/images/og-image.jpg';
  const images=img==='/images/og-image.jpg'?[{url:absoluteUrl(img),width:1024,height:1024,alt:resolvedTitle}]:[{url:absoluteUrl(img),alt:resolvedTitle}];
  const translated=Object.fromEntries(Object.entries(languages||{[locale]:path}).filter(([,value])=>!isExcluded(value,s)).map(([k,v])=>[k,absoluteUrl(v)]));
  return {
    metadataBase:new URL(siteOrigin()),title:resolvedTitle,description:resolvedDescription,
    alternates:{canonical:absoluteUrl(path),languages:translated},
    robots:{index:productionIndexing()&&s.indexable!==false&&indexable&&!isExcluded(path.split('?')[0],s),follow:s.follow!==false},
    verification:{google:s.googleVerification||undefined,other:s.bingVerification?{'msvalidate.01':s.bingVerification}:undefined},
    openGraph:{title:resolvedTitle,description:resolvedDescription,url:absoluteUrl(path),siteName:name,locale:locale==='ar'?'ar_YE':'en_US',type,images},
    twitter:{card:'summary_large_image',title:resolvedTitle,description:resolvedDescription,images:[absoluteUrl(img)]},
  };
}
export function listingPolicy(path:string,query:Record<string,string|undefined>,itemCount?:number,pageSize=12) {
  const requested=Number(query.page);
  const page=Number.isSafeInteger(requested)&&requested>1?Math.min(1000000,requested):1;
  return {path:page>1?`${path}?page=${page}`:path,indexable:!query.search&&!query.category&&!query.brand&&!query.sort&&!Object.keys(query).some(k=>k.startsWith('attr.')&&query[k])&&(itemCount===undefined||(itemCount>0&&(page-1)*pageSize<itemCount))};
}
// Resolve old slugs only when a content lookup returns an actual 404.
export async function contentData<T>(endpoint:string,tags:string[],path:string):Promise<T> {
  try { return (await apiGet<{data:T}>(endpoint,tags)).data; }
  catch (error) {
    if (!(error instanceof Error)||error.message!=='NOT_FOUND') throw error;
    let target:string|undefined;
    try {
      const redirect=await apiGet<{data:null|{targetPath:string;statusCode:number}}>(`/api/v1/public/seo/redirects/resolve?${new URLSearchParams({path})}`,['seo-redirects']);
      target=redirect.data?.targetPath;
    } catch { /* The content service already confirmed 404; preserve it if redirects are unavailable. */ }
    if(target&&/^\/(ar|en)(\/|$)/.test(target)&&!/[\\\r\n?#]/.test(target)&&target!==path) permanentRedirect(target);
    notFound();
  }
}
export function JsonLd({data}:{data:unknown}) { return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:(JSON.stringify(data)||'null').replace(/</g,'\\u003c')}}/>; }
export function breadcrumbs(items:Array<{name:string;path:string}>) { return {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:items.map((item,i)=>({'@type':'ListItem',position:i+1,name:item.name,item:absoluteUrl(item.path)}))}; }
export function collectionSchema(title:string,path:string,items:Array<{name:string;path:string}>) { return {'@context':'https://schema.org','@type':'CollectionPage',name:title,url:absoluteUrl(path),mainEntity:{'@type':'ItemList',itemListElement:items.map((item,i)=>({'@type':'ListItem',position:i+1,name:item.name,url:absoluteUrl(item.path)}))}}; }
