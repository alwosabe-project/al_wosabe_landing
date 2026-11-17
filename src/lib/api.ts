import type { Locale } from './locales';
const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
export interface Media { id: string; url: string; altAr?: string; altEn?: string }
export interface SeoContent { publishedItemCount?: number; indexable?: boolean; ogImageUrl?: string; updatedAt?: string; alternateSlugs?: Record<string,string> }
export interface Category extends SeoContent { id: string; name: string; slug: string; description: string; seoTitle?: string; seoDescription?: string; image?: Media | null }
export interface Brand extends SeoContent { id: string; name: string; slug: string; descriptionAr?: string; descriptionEn?: string; seoTitleAr?: string; seoTitleEn?: string; seoDescriptionAr?: string; seoDescriptionEn?: string; logo?: Media | null }
export interface Product extends SeoContent { id: string; name: string; slug: string; shortDescription: string; description: string; seoTitle?: string; seoDescription?: string; mainImage?: Media | null; brand?: Brand | null; primaryCategory?: Category; gallery?: Array<{id:string;media:Media}>; publishedAt?: string }
export interface BlogPost extends SeoContent { id: string; title: string; slug: string; excerpt: string; contentHtml: string; seoTitle?: string; seoDescription?: string; readingTimeMinutes: number; coverImage?: Media | null; publishedAt: string; createdAt?: string; author?: {name:string}; related?: BlogPost[] }
export interface BlogTaxonomy extends SeoContent { id:string; name:string; slug:string; description?:string; seoTitle?:string; seoDescription?:string; nameAr?:string; nameEn?:string; seoTitleAr?:string; seoTitleEn?:string; seoDescriptionAr?:string; seoDescriptionEn?:string }
export interface ApiList<T> { data: T[]; meta: {page:number;limit:number;total:number;totalPages:number} }
export interface CompletedTender extends SeoContent {
  id: string; title: string; slug: string; summary: string; description: string; completionDate: string;
  beneficiaryName: string; seoTitle?: string; seoDescription?: string; coverImage: Media | null;
  gallery: Array<{ id: string; media: Media }>; publishedAt: string;
}
export async function apiGet<T>(path: string, tags: string[] = [], revalidate = 300): Promise<T> { const response = await fetch(`${API_URL}${path}`, { next: { revalidate, tags } }); if (response.status === 404) throw new Error('NOT_FOUND'); if (!response.ok) throw new Error(`API ${response.status}`); return response.json() as Promise<T>; }
// Preview requests deliberately bypass the shared fetch cache and never log their URL.
export async function previewPost(locale: Locale, id: string, token: string): Promise<BlogPost | null> {
  let response:Response;
  try { response = await fetch(`${API_URL}/api/v1/public/blog/preview/${encodeURIComponent(id)}?${new URLSearchParams({locale,token})}`, {cache:'no-store',referrerPolicy:'no-referrer'}); }
  catch { throw new Error('Preview service unavailable'); }
  if ([400,401,403,404].includes(response.status)) return null;
  if (!response.ok) throw new Error('Preview service unavailable');
  return ((await response.json()) as {data:BlogPost}).data;
}
export async function safeList<T>(path: string, tags: string[]): Promise<ApiList<T>> {
  try {
    return await apiGet<ApiList<T>>(path, tags);
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') {
      return { data: [], meta: { page: 1, limit: 12, total: 0, totalPages: 1 } };
    }
    console.error(`[API ERROR - safeList] Path: ${path}`, error.message || error);
    throw error;
  }
}

export async function safeData<T>(path: string, tags: string[]): Promise<T[]> {
  try {
    return (await apiGet<{data:T[]}>(path, tags)).data;
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') {
      return [];
    }
    console.error(`[API ERROR - safeData] Path: ${path}`, error.message || error);
    throw error;
  }
}
export function localeQuery(locale: Locale) { return `locale=${locale}`; }

export interface PublicSettings {
  whatsapp?: string;
  phone?: string;
  email?: string;
  pageSize?: number;
  showFeaturedProducts?: boolean;
  showLatestPosts?: boolean;
}

// Validate at runtime: TypeScript types alone do not check data returned by the API.
// Ignore malformed fields so one incorrect CMS setting cannot crash SSR on every page.
export function parsePublicSettings(input: unknown): PublicSettings {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {};
  const data = input as Record<string, unknown>;
  const result: PublicSettings = {};
  const internationalPhone = /^\+?[1-9]\d{6,14}$/;

  for (const key of ['whatsapp', 'phone'] as const) {
    const value = data[key];
    if (typeof value === 'string' && internationalPhone.test(value.trim())) {
      result[key] = value.trim();
    } else if (value !== undefined) {
      console.warn(`[public/settings] Ignoring invalid ${key} value`);
    }
  }
  if (typeof data.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    result.email = data.email.trim();
  }
  if (typeof data.pageSize === 'number' && Number.isInteger(data.pageSize) && data.pageSize >= 1 && data.pageSize <= 100) {
    result.pageSize = data.pageSize;
  }
  for (const key of ['showFeaturedProducts', 'showLatestPosts'] as const) {
    const value = data[key];
    if (typeof value === 'boolean') result[key] = value;
  }
  return result;
}

export async function getSettings(): Promise<PublicSettings> {
  try {
    const res = await apiGet<{ data: unknown }>('/api/v1/public/settings', ['settings']);
    return parsePublicSettings(res.data);
  } catch (error) {
    console.error('[public/settings] Failed to fetch settings:', error instanceof Error ? error.message : 'unknown error');
    return {};
  }
}
