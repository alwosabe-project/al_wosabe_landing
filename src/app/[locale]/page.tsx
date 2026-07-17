import { notFound } from "next/navigation";
import { LandingPage } from "@/components/sections/LandingPage";
import { isLocale, type Locale } from "@/lib/locales";
import { safeData, safeList, getSettings, type BlogPost, type Brand, type Category, type Product } from "@/lib/api";
import { company } from "@/data/site";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

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
