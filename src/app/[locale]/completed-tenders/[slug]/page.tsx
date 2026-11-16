import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { completionDateLabel } from '@/components/ui/CompletedTenderCard';
import type { CompletedTender } from '@/lib/api';
import { decodeRouteSegment, isLocale, type Locale } from '@/lib/locales';
import { breadcrumbs, contentData, JsonLd, languagePaths, pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string; slug: string }> };
function getTender(locale: Locale, slug: string) {
  return contentData<CompletedTender>(`/api/v1/public/completed-tenders/${encodeURIComponent(slug)}?locale=${locale}`, ['completed-tenders'], `/${locale}/completed-tenders/${encodeURIComponent(slug)}`);
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug: rawSlug } = await params;
  const slug = decodeRouteSegment(rawSlug);
  if (!isLocale(locale)) notFound();
  const tender = await getTender(locale,slug), path = `/${locale}/completed-tenders/${encodeURIComponent(tender.slug)}`;
  return pageMetadata({ locale, path, title: tender.seoTitle || tender.title, description: tender.seoDescription || tender.summary, image: tender.ogImageUrl || tender.coverImage?.url, indexable: tender.indexable !== false, languages: languagePaths(locale,path,'completed-tenders',tender.alternateSlugs) });
}
export default async function Page({ params }: Props) {
  const { locale, slug: rawSlug } = await params;
  const slug = decodeRouteSegment(rawSlug);
  if (!isLocale(locale)) notFound();
  const tender = await getTender(locale,slug), path = `/${locale}/completed-tenders/${encodeURIComponent(tender.slug)}`, languages = languagePaths(locale,path,'completed-tenders',tender.alternateSlugs);
  return <><Header locale={locale} alternatePaths={languages}/><main className="min-h-screen bg-paper pt-32 pb-24"><article className="mx-auto max-w-5xl px-5">
    <Link className="font-bold text-brand" href={`/${locale}/completed-tenders`}>{locale === 'ar' ? 'العودة إلى المناقصات المنفذة' : 'Back to completed tenders'}</Link>
    <h1 className="font-display mt-6 text-4xl font-extrabold leading-tight lg:text-6xl">{tender.title}</h1>
    <p className="mt-6 text-graphite-500">{locale === 'ar' ? 'تاريخ الإنجاز: ' : 'Completion date: '}<time dateTime={tender.completionDate}>{completionDateLabel(tender.completionDate,locale)}</time></p>
    {tender.beneficiaryName && <p className="mt-3 text-graphite-600">{locale === 'ar' ? 'الجهة المستفيدة: ' : 'Beneficiary: '}{tender.beneficiaryName}</p>}
    <p className="mt-6 whitespace-pre-line text-xl leading-9 text-graphite-600">{tender.summary}</p>
    {tender.coverImage && <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-3xl"><Image src={tender.coverImage.url} alt={(locale === 'ar' ? tender.coverImage.altAr : tender.coverImage.altEn) || tender.title} fill priority sizes="(max-width: 1024px) 100vw, 1024px" className="object-cover"/></div>}
    <div className="mt-10 whitespace-pre-line break-words text-lg leading-9 text-graphite-700">{tender.description}</div>
    {tender.gallery.length > 0 && <section className="mt-14"><h2 className="font-display mb-6 text-2xl font-bold">{locale === 'ar' ? 'معرض الصور' : 'Gallery'}</h2><div className="grid gap-5 sm:grid-cols-2">{tender.gallery.map(({ id, media }) => <a key={id} href={media.url} target="_blank" rel="noopener noreferrer" className="relative block aspect-[4/3] overflow-hidden rounded-2xl"><Image src={media.url} alt={(locale === 'ar' ? media.altAr : media.altEn) || tender.title} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover"/></a>)}</div></section>}
  </article><JsonLd data={breadcrumbs([{ name: locale === 'ar' ? 'الرئيسية' : 'Home', path: `/${locale}` }, { name: locale === 'ar' ? 'المناقصات المنفذة' : 'Completed Tenders', path: `/${locale}/completed-tenders` }, { name: tender.title, path }])}/></main><Footer locale={locale}/></>;
}
