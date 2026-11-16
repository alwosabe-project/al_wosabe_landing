import Image from 'next/image';
import Link from 'next/link';
import type { CompletedTender } from '@/lib/api';
import type { Locale } from '@/lib/locales';

export function completionDateLabel(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-YE' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));
}
export function CompletedTenderCard({ tender, locale }: { tender: CompletedTender; locale: Locale }) {
  return <article className="overflow-hidden rounded-2xl border border-steel-200 bg-paper">
    <Link href={`/${locale}/completed-tenders/${encodeURIComponent(tender.slug)}`} className="group block">
      <div className="relative aspect-[16/9] bg-sand-50">{tender.coverImage && <Image src={tender.coverImage.url} alt={(locale === 'ar' ? tender.coverImage.altAr : tender.coverImage.altEn) || tender.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform group-hover:scale-105"/>}</div>
      <div className="p-6"><p className="text-sm text-graphite-500">{locale === 'ar' ? 'تاريخ الإنجاز: ' : 'Completed: '}<time dateTime={tender.completionDate}>{completionDateLabel(tender.completionDate,locale)}</time></p><h2 className="font-display mt-3 text-xl font-bold text-ink-900">{tender.title}</h2>{tender.beneficiaryName && <p className="mt-2 text-sm text-graphite-500">{tender.beneficiaryName}</p>}<p className="mt-3 line-clamp-3 text-sm leading-7 text-graphite-600">{tender.summary}</p><span className="mt-5 inline-block font-bold text-brand">{locale === 'ar' ? 'عرض التفاصيل' : 'View details'}</span></div>
    </Link>
  </article>;
}
