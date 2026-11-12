import { notFound } from "next/navigation";
import { LandingPage } from "@/components/sections/LandingPage";
import { isLocale, type Locale } from "@/lib/locales";
import { safeData, safeList, getSettings, type BlogPost, type Brand, type Category, type Product } from "@/lib/api";
import { company } from "@/data/site";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {getSeoSettings,pageMetadata,languagePaths,localized} from '@/lib/seo';
export async function generateMetadata({params}:{params:Promise<{locale:string}>}) {
  const {locale}=await params;if(!isLocale(locale))notFound();const s=await getSeoSettings();
  const metadata=await pageMetadata({locale,path:`/${locale}`,title:localized(s.homeTitleAr,s.homeTitleEn,locale),description:localized(s.homeDescriptionAr,s.homeDescriptionEn,locale),languages:languagePaths(locale,`/${locale}`)});
  if(metadata.openGraph){metadata.openGraph.title=localized(s.ogTitleAr,s.ogTitleEn,locale)||metadata.title as string;metadata.openGraph.description=localized(s.ogDescriptionAr,s.ogDescriptionEn,locale)||metadata.description||undefined;}
  if(metadata.twitter){metadata.twitter.title=localized(s.twitterTitleAr,s.twitterTitleEn,locale)||metadata.title as string;metadata.twitter.description=localized(s.twitterDescriptionAr,s.twitterDescriptionEn,locale)||metadata.description||undefined;}
  return metadata;
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const locale = rawLocale as Locale;
  const [categories, brands, featured, posts, settings] = await Promise.all([
    safeData<Category>(`/api/v1/public/categories?locale=${locale}`, ["categories"]),
    safeData<Brand>("/api/v1/public/brands", ["brands"]),
    safeList<Product>(`/api/v1/public/products/featured?locale=${locale}&limit=6`, ["products"]),
    safeList<BlogPost>(`/api/v1/public/blog/posts?locale=${locale}&limit=3`, ["blog-posts"]),
    getSettings(),
  ]);
  const whatsappNumber = settings.whatsapp || company.whatsappNumber;
  return (
    <>
      <Header locale={locale} />
      <LandingPage locale={locale} whatsappNumber={whatsappNumber} home={{ categories, brands, featured: featured.data, posts: posts.data }} />
      <Footer locale={locale} />
    </>
  );
}
