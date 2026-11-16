import Image from "next/image";
import Link from "next/link";
import { Building2, CheckCircle2, Package, Truck } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ProductCategoryCard } from "@/components/ui/ProductCategoryCard";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { QuoteForm } from "@/components/sections/QuoteForm";
import { ParallaxImage } from "@/components/ui/ParallaxImage";
import { BrandMarquee } from "@/components/ui/BrandMarquee";
import { Hero } from "@/components/sections/Hero";
import { Distribution } from "@/components/sections/Distribution";
import { Branches } from "@/components/sections/Branches";
import {
  branches,
  company,
  content,
  structuredOrganization,
  valueIcons,
} from "@/data/site";
import type { Locale } from "@/lib/locales";
import type { BlogPost, Brand, Category, Product } from "@/lib/api";
import { cn, whatsappHref } from "@/lib/utils";

export type HomeData = { categories: Category[]; brands: Brand[]; featured: Product[]; posts: BlogPost[] };

export function LandingPage({ locale, home, whatsappNumber }: { locale: Locale; home: HomeData; whatsappNumber: string }) {
  const years = new Date().getFullYear() - company.establishedYear;

  return (
    <>
      <main className="overflow-x-hidden">
        <Hero locale={locale} years={years} categories={home.categories} featured={home.featured} hero={content[locale].hero} branchCount={branches.length} />
        <Stats locale={locale} years={years} />
        <About locale={locale} />
        <Operations locale={locale} />
        <Products locale={locale} categories={home.categories} />
        <Brands locale={locale} brands={home.brands} />
        <LatestPosts locale={locale} posts={home.posts} />
        <Distribution locale={locale} heading={<SectionHeading {...content[locale].distribution} dark />} />
        <Fleet locale={locale} />
        <Branches locale={locale} heading={<SectionHeading {...content[locale].branches} />} />
        <Values locale={locale} />
        <Team locale={locale} />
        <Quote locale={locale} categories={home.categories} whatsappNumber={whatsappNumber} />
      </main>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            ...structuredOrganization,
            contactPoint: {
              ...structuredOrganization.contactPoint,
              telephone: `+${whatsappNumber.replace(/^\+/, '')}`,
            },
          }),
        }}
      />
    </>
  );
}

/* ───────────────────────── Hero ───────────────────────── */
/* ───────────────────────── Stats ───────────────────────── */
function Stats({ locale, years }: { locale: Locale; years: number }) {
  const stats = content[locale].stats;

  return (
    <section className="bg-sand-50 py-20 sm:py-24">
      <Container>
        <SectionHeading eyebrow={stats.eyebrow} title={stats.title} align="center" />
        <div className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-5">
          {stats.items.map(([value, label], index) => {
            const isYears = value === "years";
            const numeric = /^\d/.test(value);
            const numberValue = isYears ? years : numeric ? Number.parseInt(value, 10) : null;
            const suffix = value.includes("+") || isYears ? "+" : "";

            return (
              <Reveal key={label} delay={index * 0.08} className={cn(index === 4 && "col-span-2 lg:col-span-1")}>
                <div className="accent-top card-rise group h-full rounded-2xl border border-steel-200 bg-paper p-6 text-center shadow-[var(--shadow-elev-1)] hover:border-steel-300">
                  <strong className="font-display block text-3xl font-extrabold tabular-nums text-ink-900 sm:text-[2.5rem]">
                    {numberValue === null ? value : <AnimatedCounter value={numberValue} suffix={suffix} />}
                  </strong>
                  <span className="mt-3 block text-xs font-bold leading-6 text-graphite-500 sm:text-sm">{label}</span>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

/* ───────────────────────── About + Timeline ───────────────────────── */
function About({ locale }: { locale: Locale }) {
  const about = content[locale].about;

  return (
    <section id="about" className="bg-paper py-20 sm:py-28">
      <Container className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <Reveal direction="right">
          <div className="overflow-hidden rounded-2xl bg-[image:var(--grad-dark)] p-8 text-white shadow-[var(--shadow-elev-3)]">
            <div className="mb-7 h-[3px] w-16 rounded-full bg-[image:var(--grad-brand)]" />
            <div className="rounded-xl border border-white/8 p-7">
              {about.timeline.map(([year, text], idx) => (
                <div key={year} className="relative pb-9 ps-7 last:pb-0">
                  <div
                    className="absolute bottom-0 start-[3px] top-1 w-px bg-steel-400/25"
                    style={{ transformOrigin: "top", animation: `timeline-draw 1.1s ease-out ${idx * 0.25}s both` }}
                  />
                  <span className="absolute -start-[3px] top-1.5 h-3 w-3 rounded-full border-2 border-ink-900 bg-brand ring-2 ring-brand/25" />
                  <strong className="font-display text-xl font-extrabold text-brand-bright">{year}</strong>
                  <p className="mt-2 text-sm leading-7 text-steel-400">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal>
          <SectionHeading eyebrow={about.eyebrow} title={about.title} />
          <div className="mt-7 grid gap-4 text-base leading-[1.9] text-graphite-600">
            {about.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

/* ───────────────────────── Operations ───────────────────────── */
function Operations({ locale }: { locale: Locale }) {
  const isAr = locale === "ar";

  const points: [string, string][] = [
    [
      isAr ? "مستودعات منظمة وجاهزية توريد" : "Organized Warehousing & Supply Readiness",
      isAr
        ? "مستودعاتنا مجهزة لتخزين الإطارات والبطاريات والزيوت بطرق منظمة تحافظ على سلامة وجودة المنتجات وتسهل عمليات الشحن السريع."
        : "Our storage spaces are tailored to house tires, batteries, and lubricants systematically, preserving product quality and facilitating rapid dispatch.",
    ],
    [
      isAr ? "إدارة منظمة للمخزون" : "Organized Inventory Management",
      isAr
        ? "نطبق أنظمة دقيقة لمراقبة المخزون تضمن توفر الفئات المطلوبة بشكل دائم وسد النقص الفوري في نقاط التوزيع المختلفة."
        : "We employ precise inventory tracking systems to maintain stock levels, avoiding supply bottlenecks and ensuring continuous availability.",
    ],
  ];

  return (
    <section className="bg-sand-50 py-20 sm:py-28">
      <Container className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <Reveal direction="right">
          <div className="steel-frame">
            <div className="relative overflow-hidden rounded-[17px] bg-ink-900">
              <ParallaxImage
                src="/images/operations/warehouse.webp"
                alt={isAr ? "مستودعات ومخزون الوصابي" : "Al-Wosabe warehouse and inventory"}
                containerClassName=""
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/15 to-transparent" />
              <div className="absolute top-4 start-4 flex items-center gap-2 rounded-lg border border-white/10 bg-ink-950/70 px-3 py-1.5 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-steel-200">
                  {isAr ? "تخزين آمن منذ 1986" : "Secure Storage Since 1986"}
                </span>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <SectionHeading
            eyebrow={isAr ? "الجاهزية التشغيلية" : "Operational Strength"}
            title={isAr ? "جاهزية تشغيلية ومستودعات منظمة" : "Organized Storage & Distribution Readiness"}
            description={
              isAr
                ? "نعتمد في الوصابي للتجارة على بنية تحتية قوية لإدارة المخزون والتوريد، تضمن تلبية احتياجات التجار والعملاء في كافة الأوقات وبجاهزية كاملة."
                : "At Al-Wosabe for Trading, we rely on a robust supply and inventory management infrastructure to serve our business partners efficiently and meet demand at all times."
            }
          />
          <div className="mt-9 space-y-5">
            {points.map(([title, body], i) => (
              <div key={title} className="flex gap-4">
                <span className="font-display flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-brand/20 bg-brand/10 text-base font-extrabold text-brand-deep">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-base font-bold text-ink-900">{title}</h3>
                  <p className="mt-1.5 text-sm leading-7 text-graphite-600">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

/* ───────────────────────── Products ───────────────────────── */
function Products({ locale, categories }: { locale: Locale; categories: Category[] }) {
  const copy = content[locale].products;

  return (
    <section id="products" className="bg-paper py-20 sm:py-28">
      <Container>
        <SectionHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
        <div className="mt-14 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3">
          {categories.map((item, index) => (
            <Reveal key={item.id} delay={index * 0.07}>
              <ProductCategoryCard
                title={item.name}
                description={item.description}
                image={item.image?.url || "/images/hero/hero-warehouse.webp"}
                icon={Package}
                category={locale === "ar" ? "فئة منتجات" : "Product category"}
                href={`/${locale}/categories/${item.slug}`}
              />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ───────────────────────── Brands ───────────────────────── */
function Brands({ locale, brands }: { locale: Locale; brands: Brand[] }) {
  const copy = content[locale].brands;

  return (
    <section id="brands" className="bg-sand-50 py-20 sm:py-28">
      <Container>
        <div className="mb-12">
          <SectionHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
        </div>
        <Reveal delay={0.1}>
          <BrandMarquee brands={brands.filter((brand) => brand.logo).map((brand) => ({ name: brand.name, logo: brand.logo!.url }))} locale={locale} />
        </Reveal>
      </Container>
    </section>
  );
}

function LatestPosts({ locale, posts }: { locale: Locale; posts: BlogPost[] }) {
  if (!posts.length) return null;
  return (
    <section className="bg-paper py-20 sm:py-28">
      <Container>
        <SectionHeading eyebrow={locale === "ar" ? "المعرفة والأخبار" : "Insights & news"} title={locale === "ar" ? "أحدث المقالات" : "Latest articles"} />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {posts.slice(0, 3).map((post, index) => (
            <Reveal key={post.id} delay={index * 0.08}>
              <Link href={`/${locale}/blog/${post.slug}`} className="group block overflow-hidden rounded-2xl border border-steel-200 bg-paper shadow-[var(--shadow-elev-1)]">
                <div className="relative aspect-[16/9] bg-sand-50">{post.coverImage && <Image src={post.coverImage.url} alt={post.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 400px" className="object-cover transition duration-500 group-hover:scale-105" />}</div>
                <div className="p-5"><h3 className="font-display text-lg font-bold text-ink-900">{post.title}</h3><p className="mt-2 line-clamp-2 text-sm leading-7 text-graphite-600">{post.excerpt}</p></div>
              </Link>
            </Reveal>
          ))}
        </div>
        <Link className="mt-8 inline-flex font-bold text-brand-ember" href={`/${locale}/blog`}>{locale === "ar" ? "عرض كل المقالات" : "View all articles"} ←</Link>
      </Container>
    </section>
  );
}

/* ───────────────────────── Distribution ───────────────────────── */
/* ───────────────────────── Fleet ───────────────────────── */
function Fleet({ locale }: { locale: Locale }) {
  const copy = content[locale].fleet;
  const isAr = locale === "ar";

  const boxes: [string, string][] = [
    [
      isAr ? "تغطية جغرافية منظمة" : "Organized Reach",
      isAr
        ? "نخدم المدن الرئيسية ونطاقًا واسعًا من السوق اليمني عبر شبكة فروع وتوزيع منظمة تضمن استقرار الإمداد للشركاء."
        : "We serve main cities and a wide scope of the Yemeni market through an organized branch and distribution network.",
    ],
    [
      isAr ? "جاهزية تشغيلية عالية" : "High Readiness",
      isAr
        ? "أسطولنا مجهز ومعد لنقل وتوزيع المنتجات الثقيلة والمختلفة تحت شتى الظروف الجغرافية والطرق الصعبة بكفاءة تامة."
        : "Our fleet is equipped and ready to transport heavy and diverse products under various terrains and difficult road conditions.",
    ],
  ];

  return (
    <section className="bg-paper py-20 sm:py-28">
      <Container className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <Reveal>
          <SectionHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
          <div className="mt-9 grid gap-5 sm:grid-cols-2">
            {boxes.map(([title, body]) => (
              <div key={title} className="rounded-2xl border border-steel-200 bg-sand-50 p-6">
                <strong className="font-display block text-lg font-extrabold text-ink-900">{title}</strong>
                <p className="mt-2.5 text-sm leading-7 text-graphite-600">{body}</p>
              </div>
            ))}
          </div>
          <div className="mt-7">
            <Button href="#branches" variant="steel">
              {isAr ? "تواصل مع أقرب فرع" : "Contact nearest branch"}
            </Button>
          </div>
        </Reveal>

        <Reveal delay={0.1} direction="left">
          <div className="steel-frame">
            <div className="relative overflow-hidden rounded-[17px] bg-ink-900">
              <ParallaxImage
                src="/images/operations/fleet.webp"
                alt={isAr ? "أسطول توزيع الوصابي" : "Al-Wosabe distribution fleet"}
                containerClassName=""
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/20 to-transparent" />
              <Reveal delay={0.25} direction="up" className="absolute bottom-6 start-6 z-10">
                <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-ink-950/75 p-4 shadow-[var(--shadow-elev-3)] backdrop-blur-md">
                  <div className="chrome flex h-13 w-13 items-center justify-center rounded-lg text-ink-950">
                    <Truck size={26} />
                  </div>
                  <div className="text-start">
                    <span className="font-display block text-2xl font-extrabold tabular-nums text-white">
                      <AnimatedCounter value={20} suffix="+" />
                    </span>
                    <span className="block text-xs font-bold uppercase tracking-wider text-brand-bright">
                      {isAr ? "شاحنة توزيع نشطة" : "Active Trucks"}
                    </span>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

/* ───────────────────────── Branches + Modal ───────────────────────── */
/* ───────────────────────── Values ───────────────────────── */
function Values({ locale }: { locale: Locale }) {
  const copy = content[locale].values;

  return (
    <section className="bg-paper py-20 sm:py-28">
      <Container>
        <SectionHeading eyebrow={copy.eyebrow} title={copy.title} align="center" />
        <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
          {copy.items.map(([title, description], index) => {
            const Icon = valueIcons[index];
            return (
              <Reveal key={title} delay={index * 0.06} className={cn(index === 2 && "col-span-2 md:col-span-1")}>
                <article className="accent-top card-rise group h-full rounded-2xl border border-steel-200 bg-sand-50 p-6 text-center shadow-[var(--shadow-elev-1)] hover:border-steel-300 sm:p-8">
                  <div className="mx-auto mb-5 flex h-15 w-15 items-center justify-center rounded-xl bg-[image:var(--grad-dark)] text-brand-bright transition-all duration-300 group-hover:bg-[image:var(--grad-brand)] group-hover:text-ink-950 sm:h-16 sm:w-16">
                    <Icon aria-hidden="true" size={26} />
                  </div>
                  <h3 className="font-display text-lg font-bold text-ink-900 sm:text-xl">{title}</h3>
                  <div className="mx-auto my-4 h-[2px] w-10 rounded-full bg-[image:var(--grad-brand)] transition-all duration-300 group-hover:w-16" />
                  <p className="text-sm leading-7 text-graphite-600">{description}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

/* ───────────────────────── Team ───────────────────────── */
function Team({ locale }: { locale: Locale }) {
  const copy = content[locale].team;
  const isAr = locale === "ar";

  const teamItems = [
    {
      title: isAr ? "خبرة السوق المحلي" : "Market Experience",
      description: isAr
        ? "فريق متمكن بخبرة عريقة تتجاوز 35 عاماً في فهم احتياجات السوق اليمني لقطع المركبات والدراجات."
        : "An expert team with over 35 years of experience in understanding Yemen's vehicle and motorcycle market.",
      Icon: Building2,
    },
    {
      title: isAr ? "تنسيق العمليات واللوجستيات" : "Operations Coordination",
      description: isAr
        ? "نعمل بتزامن كامل لإدارة النقل والتوزيع وضمان وصول الشحنات بكفاءة تامة لكافة الفروع والموزعين."
        : "We operate in sync to manage dispatch and distribution, ensuring deliveries reach all branches and distributors.",
      Icon: Truck,
    },
    {
      title: isAr ? "خدمة العملاء والتجار" : "Customer Service",
      description: isAr
        ? "نوفر قنوات تواصل مباشرة وسريعة لتلبية طلبات عروض الأسعار والتجهيز الفوري للمعاملات التجارية."
        : "We offer direct, fast channels to fulfill quote requests and process commercial orders promptly.",
      Icon: CheckCircle2,
    },
  ];

  return (
    <section className="bg-sand-50 py-20 sm:py-28">
      <Container className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <Reveal direction="right">
          <div className="steel-frame">
            <div className="relative overflow-hidden rounded-[17px] bg-ink-900">
              <ParallaxImage
                src="/images/operations/team.webp"
                alt={isAr ? "فريق عمليات وتوزيع الوصابي" : "Al-Wosabe operations and distribution team"}
                sizes="(max-width: 1024px) 100vw, 45vw"
                aspectRatio="aspect-[16/10]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 start-4 rounded-lg border border-white/10 bg-ink-950/65 px-3 py-1.5 backdrop-blur-md">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-bright">
                  {isAr ? "فريق عمل متخصص" : "Professional Team"}
                </span>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <SectionHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
          <div className="mt-9 space-y-4">
            {teamItems.map(({ title, description, Icon }) => (
              <div
                key={title}
                className="group flex gap-4 rounded-2xl border border-steel-200 bg-paper p-5 transition-all duration-300 hover:border-brand/25 hover:shadow-[var(--shadow-elev-2)]"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[image:var(--grad-dark)] text-brand-bright shadow-[var(--shadow-elev-1)] transition-all duration-300 group-hover:bg-[image:var(--grad-brand)] group-hover:text-ink-950">
                  <Icon aria-hidden="true" size={22} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-ink-900 transition-colors duration-300 group-hover:text-brand-deep">
                    {title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-7 text-graphite-600">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

/* ───────────────────────── Quote ───────────────────────── */
function Quote({ locale, categories, whatsappNumber }: { locale: Locale; categories: Category[]; whatsappNumber: string }) {
  const copy = content[locale].quote;
  const directMessage =
    locale === "ar"
      ? "مرحباً، أريد طلب عرض سعر من الوصابي للتجارة."
      : "Hello, I would like to request a quote from Al-Wosabe for Trading.";

  return (
    <section id="quote" className="relative overflow-hidden bg-ink-950 py-20 text-on-dark sm:py-28">
      <div className="ambient-dark pointer-events-none absolute inset-0" />
      <div className="blueprint-grid pointer-events-none absolute inset-0 opacity-50" />

      <Container className="relative grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <Reveal direction="right">
          <SectionHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.description} dark />
          <Button href={whatsappHref(whatsappNumber, directMessage)} className="mt-9">
            {copy.submit}
          </Button>
        </Reveal>
        <Reveal direction="left">
          <QuoteForm labels={copy} locale={locale} categories={categories} whatsappNumber={whatsappNumber} />
        </Reveal>
      </Container>
    </section>
  );
}
