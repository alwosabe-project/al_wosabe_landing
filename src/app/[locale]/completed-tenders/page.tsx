import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CompletedTenderCard } from '@/components/ui/CompletedTenderCard';
import { apiGet, type ApiList, type CompletedTender } from '@/lib/api';
import { isLocale, type Locale } from '@/lib/locales';
import { languagePaths, listingPolicy, pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | undefined>> };
const title = (locale: Locale) => locale === 'ar' ? 'المناقصات المنفذة' : 'Completed Tenders';
const description = (locale: Locale) => locale === 'ar' ? 'سجل المناقصات وأعمال التوريد التي فازت بها شركة الوصابي وأكملت تنفيذها فعليًا.' : 'Tenders and supply projects won and fully completed by Al-Wosabe for Trading.';
function getList(locale: Locale, page: number) { return apiGet<ApiList<CompletedTender>>(`/api/v1/public/completed-tenders?locale=${locale}&page=${page}&limit=12`, ['completed-tenders']); }
function pageNumber(query: Record<string, string | undefined>) { const n = Number(query.page); return Number.isSafeInteger(n) && n > 0 ? Math.min(1000000,n) : 1; }
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  const query = await searchParams, result = await getList(locale,pageNumber(query)), path = `/${locale}/completed-tenders`;
  const policy = listingPolicy(path,query,result.meta.total);
  return pageMetadata({ locale, ...policy, title: title(locale), description: description(locale), languages: languagePaths(locale,policy.path) });
}
export default async function Page({ params, searchParams }: Props) {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  const query = await searchParams, page = pageNumber(query), result = await getList(locale,page);
  if (page > result.meta.totalPages) notFound();
  return <><Header locale={locale} alternatePaths={languagePaths(locale,`/${locale}/completed-tenders`)}/><main className="min-h-screen bg-sand-50 pt-32 pb-24"><div className="mx-auto max-w-7xl px-5">
    <h1 className="font-display text-4xl font-extrabold">{title(locale)}</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-graphite-600">{description(locale)}</p>
    {result.data.length ? <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{result.data.map(tender => <CompletedTenderCard key={tender.id} tender={tender} locale={locale}/>)}</div> : <p className="mt-10 rounded-2xl bg-paper p-12 text-center text-graphite-500">{locale === 'ar' ? 'سيتم عرض المناقصات المنفذة هنا بعد نشرها.' : 'Completed tenders will appear here once published.'}</p>}
    {result.meta.totalPages > 1 && <nav className="mt-10 flex items-center justify-center gap-4" aria-label={locale === 'ar' ? 'الصفحات' : 'Pagination'}>{page > 1 && <Link className="rounded-xl bg-paper px-5 py-3" href={`?page=${page-1}`}>{locale === 'ar' ? 'السابق' : 'Previous'}</Link>}<span>{page} / {result.meta.totalPages}</span>{page < result.meta.totalPages && <Link className="rounded-xl bg-paper px-5 py-3" href={`?page=${page+1}`}>{locale === 'ar' ? 'التالي' : 'Next'}</Link>}</nav>}
  </div></main><Footer locale={locale}/></>;
}
