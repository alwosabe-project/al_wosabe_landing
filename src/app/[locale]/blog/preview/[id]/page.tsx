import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { previewPost } from '@/lib/api';
import { isLocale, type Locale } from '@/lib/locales';

export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Private preview',robots:{index:false,follow:false,nocache:true},referrer:'no-referrer'};
export default async function Page({ params, searchParams }: { params: Promise<{ locale: string; id: string }>; searchParams: Promise<{ token?: string }> }) {
  const { locale: raw, id } = await params;
  const token = (await searchParams).token;

  if (!isLocale(raw) || !token) notFound();

  const locale = raw as Locale;
  const post = await previewPost(locale, id, token);
  if (!post) notFound();

  return (
    <>
      <Header locale={locale} />
      <main className="bg-paper pt-32 pb-24">
        <article className="mx-auto max-w-4xl px-5">
          <div className="mb-8 rounded-lg bg-orange-100 p-4 text-center text-orange-800 font-bold">
            {locale === 'ar' ? 'وضع المعاينة - هذه المقالة غير منشورة بعد' : 'Preview Mode - This post is not published yet'}
          </div>
          <nav className="mb-7 text-sm text-graphite-500">
            <Link href={`/${locale}`}>{locale === 'ar' ? 'الرئيسية' : 'Home'}</Link> / <Link href={`/${locale}/blog`}>{locale === 'ar' ? 'المدونة' : 'Blog'}</Link>
          </nav>
          <p className="text-sm text-graphite-500">
            {post.publishedAt || post.createdAt ? new Date(post.publishedAt || post.createdAt!).toLocaleDateString(locale === 'ar' ? 'ar-YE' : 'en-US') : (locale === 'ar' ? 'مسودة غير مؤرخة' : 'Undated draft')} · {post.author?.name} · {post.readingTimeMinutes} {locale === 'ar' ? 'دقائق قراءة' : 'min read'}
          </p>
          <h1 className="font-display mt-5 text-4xl font-extrabold leading-tight lg:text-6xl">{post.title}</h1>
          <p className="mt-6 text-xl leading-9 text-graphite-600">{post.excerpt}</p>
          {post.coverImage && (
            <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-3xl">
              <Image src={post.coverImage.url} alt={post.title} fill priority className="object-cover" />
            </div>
          )}
          <div className="prose-content mt-12 text-lg leading-9 text-graphite-700" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
        </article>
      </main>
      <Footer locale={locale} />
    </>
  );
}
