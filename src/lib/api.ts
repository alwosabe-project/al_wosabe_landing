import type { Locale } from './locales';
const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
export interface Media { id: string; url: string; altAr?: string; altEn?: string }
export interface Category { id: string; name: string; slug: string; alternateSlugs?: Record<string, string>; description: string; seoTitle?: string; seoDescription?: string; image?: Media | null }
export interface Brand { id: string; name: string; slug: string; descriptionAr?: string; descriptionEn?: string; logo?: Media | null }
export interface Product { id: string; name: string; slug: string; alternateSlugs?: Record<string, string>; shortDescription: string; description: string; seoTitle?: string; seoDescription?: string; mainImage?: Media | null; brand?: Brand | null; primaryCategory?: Category; gallery?: Array<{id:string;media:Media}>; publishedAt?: string }
export interface BlogPost { id: string; title: string; slug: string; alternateSlugs?: Record<string, string>; excerpt: string; contentHtml: string; seoTitle?: string; seoDescription?: string; readingTimeMinutes: number; coverImage?: Media | null; publishedAt: string; author?: {name:string}; related?: BlogPost[] }
export interface ApiList<T> { data: T[]; meta: {page:number;limit:number;total:number;totalPages:number} }
export async function apiGet<T>(path: string, tags: string[] = [], revalidate = 300): Promise<T> { const response = await fetch(`${API_URL}${path}`, { next: { revalidate, tags } }); if (response.status === 404) throw new Error('NOT_FOUND'); if (!response.ok) throw new Error(`API ${response.status}`); return response.json() as Promise<T>; }
export async function safeList<T>(path: string, tags: string[]): Promise<ApiList<T>> { try { return await apiGet<ApiList<T>>(path, tags); } catch { return {data:[],meta:{page:1,limit:12,total:0,totalPages:1}}; } }
export async function safeData<T>(path: string, tags: string[]): Promise<T[]> { try { return (await apiGet<{data:T[]}>(path,tags)).data; } catch { return []; } }
export function localeQuery(locale: Locale) { return `locale=${locale}`; }

export async function getSettings(): Promise<Record<string, string>> {
  try {
    const res = await apiGet<{ data: Record<string, string> }>('/api/v1/public/settings', ['settings']);
    return res.data;
  } catch {
    return {};
  }
}
