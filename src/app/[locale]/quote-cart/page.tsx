import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { QuoteCheckout } from '@/components/catalog/QuoteCheckout';
import { isLocale } from '@/lib/locales';

export const metadata: Metadata = { title: 'طلب عرض سعر | Quote request', robots: { index: false, follow: false } };
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <><Header locale={locale} /><main className="min-h-screen bg-paper pb-24 pt-32"><div className="mx-auto max-w-7xl px-5"><h1 className="mb-4 text-3xl font-extrabold">{locale === 'ar' ? 'سلة طلب عرض السعر' : 'Quote request cart'}</h1><p className="mb-8 text-graphite-600">{locale === 'ar' ? 'راجع المنتجات والكميات، ثم أرسل بياناتك للحصول على عرض سعر.' : 'Review products and quantities, then send your details to request a quote.'}</p><QuoteCheckout locale={locale} /></div></main><Footer locale={locale} /></>;
}
