import type { Metadata } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import "@/app/globals.css";
import { isLocale, localeDirection, locales, type Locale } from "@/lib/locales";
import { siteMeta, company } from "@/data/site";
import { getSettings } from "@/lib/api";
import { Preloader } from "@/components/layout/Preloader";
import { PageTransition } from "@/components/layout/PageTransition";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { FloatingWhatsAppButton } from "@/components/ui/FloatingWhatsAppButton";
import { BackToTopButton } from "@/components/ui/BackToTopButton";
import {Suspense} from 'react';
import {MarketingProvider} from '@/components/marketing/MarketingProvider';
import type {MarketingConfig} from '@/lib/marketing';
import {apiGet} from '@/lib/api';
import {getSeoSettings,JsonLd,localized} from '@/lib/seo';
import {siteOrigin,absoluteUrl} from '@/lib/site-url';

const alexandria = localFont({
  src: [
    { path: "../../../public/fonts/Alexandria-Light.ttf", weight: "300" },
    { path: "../../../public/fonts/Alexandria-Regular.ttf", weight: "400" },
    { path: "../../../public/fonts/Alexandria-Medium.ttf", weight: "500" },
    { path: "../../../public/fonts/Alexandria-SemiBold.ttf", weight: "600" },
    { path: "../../../public/fonts/Alexandria-Bold.ttf", weight: "700" },
    { path: "../../../public/fonts/Alexandria-ExtraBold.ttf", weight: "800" },
    { path: "../../../public/fonts/Alexandria-Black.ttf", weight: "900" },
  ],
  variable: "--font-alexandria",
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : "ar";
  return {metadataBase:new URL(siteOrigin()),keywords:siteMeta[locale].keywords};
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const locale = rawLocale as Locale;
  const settings = await getSettings();
  const [seo,marketing]=await Promise.all([getSeoSettings(),apiGet<{data:MarketingConfig}>('/api/v1/public/marketing/config',['marketing']).then(r=>r.data).catch(()=>({consent:{version:1 as const,analyticsDefault:false as const,adsDefault:false as const},providers:{},eventRules:[]}))]);
  const whatsappNumber = settings.whatsapp || company.whatsappNumber;
  const organizationName=localized(seo.companyNameAr,seo.companyNameEn,locale)||(locale==='ar'?'الوصابي للتجارة':'Al-Wosabe for Trading');

  return (
    <html lang={locale} dir={localeDirection(locale)}>
      <body className={`${alexandria.variable} font-body antialiased`}>
        <Preloader locale={locale} />
        <ScrollProgress />
        <PageTransition>{children}</PageTransition>
        <Suspense fallback={null}><MarketingProvider config={marketing} locale={locale}/></Suspense>
        <JsonLd data={{'@context':'https://schema.org','@type':'Organization','@id':`${siteOrigin()}/#organization`,name:organizationName,url:siteOrigin(),...(seo.logoUrl?{logo:absoluteUrl(seo.logoUrl)}:{}),...(seo.socialLinks?.length?{sameAs:seo.socialLinks}:{})}}/>
        <JsonLd data={{'@context':'https://schema.org','@type':'WebSite','@id':`${siteOrigin()}/#website`,url:siteOrigin(),name:localized(seo.siteNameAr,seo.siteNameEn,locale)||organizationName,inLanguage:locale}}/>
        <FloatingWhatsAppButton locale={locale} whatsappNumber={whatsappNumber} />
        <BackToTopButton />
      </body>
    </html>
  );
}
